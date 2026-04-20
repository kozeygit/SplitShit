## Purpose
**Splitshit** is a mobile bill-splitting application built with React Native/Expo that helps groups of people split bills fairly. It allows you to create bills, add items, assign items to specific payers, and calculate how much each person owes.

## How It Works

### Core Features

1. **Bill Management** (app/(homeTabs)/index.tsx/index.tsx))
   - Create new bills with name, date, total amount, and service charge
   - View all bills in a list with expandable options (Edit, Complete, Delete)
   - Mark bills as complete
   - Optionally scan receipts using camera to auto-populate bill details via OCR

2. **Bill Details** (app/(billTabs)/bill.tsx/bill.tsx))
   - Add items to a bill with individual prices and quantities
   - Edit item details
   - Manage payers for the bill (add/remove people, set party size)
   - Track service charge (as percentage or fixed amount)

3. **Item Assignment** (app/(billTabs)/assignItems.tsx/assignItems.tsx))
   - Assign each bill item to specific payers
   - Split items among multiple people if needed

4. **Breakdown** (app/(billTabs)/breakdown.tsx/breakdown.tsx))
   - View itemized breakdown showing what each payer ordered
   - Calculate service charge per person
   - Display total amount each person owes

5. **Payer Management** (app/(homeTabs)/payers.tsx/payers.tsx))
   - Create and manage global payers with contact info (name, email, phone)
   - Reuse payers across multiple bills

### Data Models

**Bill**: Contains bill name, date, total, service charge, items, and payers
**BillItem**: Individual items with name, price, quantity, and assigned payers
**Payer**: Person info including name, contact details, party size, and amount owed

### Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router with file-based navigation
- **Database**: SQLite with Drizzle ORM (db/schema.ts)
- **State Management**: Zustand (utils/billStore.ts)
- **OCR**: MLKit for receipt scanning → Google Gemini API for parsing bill data
- **Forms**: React Hook Form + Zod validation
- **UI**: React Native built-in components with custom styling

### Data Flow

1. User creates a bill → insertBill
2. Items and payers are added → insertBillItem, insertPayer
3. Items are assigned to payers → stored in `assignedItems` table
4. Bill is saved to local SQLite database via updateBill
5. On bill view, data is fetched and transformed via mapToModel.ts


GitHub Copilot: # Splitshit Architecture Refactor Plan

## Overview
This document outlines a strategic refactoring plan for the Splitshit codebase, prioritizing stability, performance, and maintainability. Follow the priority order for best results.

---

## 1. Implement React Query for Data Fetching

**Priority:** 🔴 **CRITICAL**  
**Difficulty:** ⭐⭐ (Medium)  
**Estimated Time:** 4-6 hours

### What Needs to Change
Currently, you're likely fetching data directly from SQLite in components without caching or deduplication. This causes:
- Multiple queries for the same data
- No automatic refetching on focus
- Manual loading state management
- Difficult data synchronization

### Current (Wrong) Approach
```javascript
// app/(billTabs)/bill.tsx
export default function BillScreen({ billId }) {
  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchBill = async () => {
      const billData = await db.select().from(bills).where(eq(bills.id, billId));
      const itemsData = await db.select().from(billItems).where(eq(billItems.billId, billId));
      setBill(billData[0]);
      setItems(itemsData);
      setLoading(false);
    };
    fetchBill();
  }, [billId]); // ❌ Fetches every time billId changes, even if already loaded

  // ❌ If user navigates away and back, fetches again
  // ❌ If multiple components need this data, fetches multiple times
}
```

### Correct Approach
```javascript
// hooks/useQueryBills.ts
import { useQuery } from '@tanstack/react-query';
import { db } from '@/db';
import { bills, billItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export function useBill(billId: string) {
  return useQuery({
    queryKey: ['bills', billId], // ✅ Cache key prevents duplicate fetches
    queryFn: async () => {
      const billData = await db.select().from(bills).where(eq(bills.id, billId));
      const itemsData = await db.select().from(billItems).where(eq(billItems.billId, billId));
      return { bill: billData[0], items: itemsData };
    },
    staleTime: 5 * 60 * 1000, // ✅ Data considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // ✅ Keep in cache for 10 minutes
  });
}

// app/(billTabs)/bill.tsx
export default function BillScreen({ billId }) {
  const { data, isLoading, error } = useBill(billId);
  // ✅ Automatically caches results
  // ✅ Deduplicates simultaneous requests
  // ✅ Refetches on app focus
  // ✅ Only one query per billId across entire app
}
```

### Why This Matters
- **Performance**: Cached data eliminates redundant database queries
- **UX**: Instant data on screen if already loaded
- **Memory**: Automatic garbage collection after `gcTime`
- **Sync**: Real-time updates when data changes

### Dependencies
- ✅ **Zustand store** - Can be simplified or removed entirely; React Query becomes source of truth
- ✅ **All data-fetching components** - Need to migrate from `useState` to `useQuery`
- ✅ **Error handling** - Must be updated to use React Query's error states

### Implementation Steps
1. Install: `npx expo install @tanstack/react-query`
2. Set up QueryClientProvider in _layout.tsx
3. Create hook files in hooks for each query type
4. Replace `useState` + `useEffect` patterns with hooks
5. Test that navigation still works correctly

### Resources
- [React Query Docs](https://tanstack.com/query/latest)
- [React Query Tutorial](https://www.youtube.com/watch?v=novnkX4l0Ew)
- [React Query + React Native](https://tanstack.com/query/latest/docs/react-native/installation)

---

## 2. Add Error Boundaries & Global Error Handling

**Priority:** 🔴 **CRITICAL**  
**Difficulty:** ⭐⭐ (Medium)  
**Estimated Time:** 2-3 hours

### What Needs to Change
Currently, errors in async operations or render can crash the entire app silently. You need:
- Error boundaries at multiple levels
- Global error logging
- User-friendly error messages
- Retry mechanisms

### Current (Wrong) Approach
```javascript
// ❌ If any error occurs, app might crash
const scanReceipt = async () => {
  const result = await geminiAPI.parseReceipt(image); // No try/catch
  setBill(result);
};

// ❌ Render error crashes entire app with no recovery
const BillComponent = ({ bill }) => {
  return <Text>{bill.name}</Text>; // Crashes if bill is undefined
};
```

### Correct Approach
```javascript
// utils/errorBoundary.tsx
import { ErrorBoundary } from 'react-native-error-boundary';
import { View, Text, Button } from 'react-native';

const ErrorFallback = ({ error, resetError }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
      Something went wrong
    </Text>
    <Text style={{ marginBottom: 20, color: '#666' }}>
      {error.message}
    </Text>
    <Button title="Try Again" onPress={resetError} />
  </View>
);

export const AppErrorBoundary = ({ children }: any) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ErrorBoundary>
);

// app/_layout.tsx
import { AppErrorBoundary } from '@/utils/errorBoundary';

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <Stack />
    </AppErrorBoundary>
  );
}

// ✅ Safe async operations with proper error handling
const scanReceipt = async () => {
  try {
    setLoading(true);
    const result = await geminiAPI.parseReceipt(image);
    setBill(result);
  } catch (error) {
    Alert.alert(
      'Scan Failed',
      error instanceof Error ? error.message : 'Unknown error occurred',
      [{ text: 'OK', onPress: () => setRetry(true) }]
    );
  } finally {
    setLoading(false);
  }
};

// ✅ Safe component with fallback UI
const BillComponent = ({ bill }: { bill?: Bill }) => {
  if (!bill) {
    return <Text>Bill not found</Text>;
  }
  return <Text>{bill.name}</Text>;
};
```

### Why This Matters
- **Stability**: App doesn't crash on errors
- **UX**: Users see helpful messages instead of blank screen
- **Debugging**: Errors are logged for troubleshooting
- **Resilience**: Can retry failed operations

### Dependencies
- ✅ **All async operations** - Need try/catch blocks
- ✅ **All components rendering optional data** - Need null checks
- ✅ **API calls** - Need error logging integration

### Implementation Steps
1. Install: `npx expo install react-native-error-boundary`
2. Create `utils/errorBoundary.tsx`
3. Add `AppErrorBoundary` to _layout.tsx
4. Add try/catch to all async functions
5. Set up error logging (Sentry recommended)

### Resources
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Native Error Boundary](https://github.com/react-native-community/hooks)
- [Sentry for React Native](https://docs.sentry.io/platforms/react-native/)

---

## 3. Implement Proper Loading & Error States

**Priority:** 🟠 **HIGH**  
**Difficulty:** ⭐ (Easy)  
**Estimated Time:** 3-4 hours

### What Needs to Change
Components should show loading spinners, skeleton screens, or error states while data is fetching. Currently likely missing or inconsistent.

### Current (Wrong) Approach
```javascript
// ❌ No loading indicator - UI is unresponsive
export default function BillsScreen() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetchBills(); // User doesn't know if it's loading
  }, []);

  return <FlatList data={bills} renderItem={...} />;
}
```

### Correct Approach
```javascript
// ✅ Show loading/error states
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function BillsScreen() {
  const { data: bills, isLoading, error } = useBills();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading bills...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FF3B30', marginBottom: 20 }}>
          Failed to load bills
        </Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  if (!bills || bills.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#999' }}>No bills yet. Create one to get started!</Text>
      </View>
    );
  }

  return <FlatList data={bills} renderItem={...} />;
}

// ✅ Or use a reusable component
import { ActivityIndicator, View, Text, Button } from 'react-native';

interface LoadableProps {
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
  onRetry?: () => void;
}

export function Loadable({ isLoading, error, children, onRetry }: LoadableProps) {
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error.message}</Text>
        {onRetry && <Button title="Retry" onPress={onRetry} />}
      </View>
    );
  }

  return <>{children}</>;
}

// Usage:
export default function BillsScreen() {
  const { data: bills, isLoading, error, refetch } = useBills();
  
  return (
    <Loadable isLoading={isLoading} error={error} onRetry={refetch}>
      <FlatList data={bills} renderItem={...} />
    </Loadable>
  );
}
```

### Why This Matters
- **UX**: Users know the app is working, not frozen
- **Debugging**: Errors are visible instead of silent
- **Polish**: Professional appearance
- **Accessibility**: Screen readers can announce state changes

### Dependencies
- ✅ **React Query integration (from #1)** - This uses React Query's `isLoading`, `error` states
- ✅ **All screens/components** - Should add loading states

### Implementation Steps
1. Create reusable `Loadable` component
2. Update all screen components to show loading
3. Test with slow network (Chrome DevTools throttling)
4. Ensure error messages are user-friendly

### Resources
- [React Native ActivityIndicator](https://reactnative.dev/docs/activityindicator)
- [Skeleton Screens](https://www.smashingmagazine.com/2020/02/skeleton-screens-react/)

---

## 4. Simplify Zustand State Management

**Priority:** 🟡 **MEDIUM**  
**Difficulty:** ⭐⭐⭐ (Hard)  
**Estimated Time:** 6-8 hours

### What Needs to Change
Once React Query is in place, much of Zustand becomes redundant. It should only store:
- **Local UI state** (selected bill, filter options, form state)
- **Global app settings** (user preferences, theme)

NOT for remote data (that's React Query's job).

### Current (Wrong) Approach
```javascript
// ❌ Zustand storing remote data (redundant with React Query)
const useBillStore = create((set) => ({
  bills: [],
  selectedBill: null,
  
  fetchBills: async () => {
    const data = await db.select().from(bills);
    set({ bills: data }); // ❌ React Query should do this
  },
  
  setBills: (bills) => set({ bills }),
}));

// Usage - you have to manage it manually
useEffect(() => {
  store.fetchBills();
}, []);

const allBills = useBillStore((state) => state.bills); // ❌ Duplicates React Query cache
```

### Correct Approach
```javascript
// ✅ Zustand for UI state only
import create from 'zustand';

interface UIState {
  // UI state only
  selectedBillId: string | null;
  filterMode: 'all' | 'completed' | 'pending';
  showNewBillModal: boolean;
  
  // Actions
  selectBill: (id: string) => void;
  setFilterMode: (mode: 'all' | 'completed' | 'pending') => void;
  toggleNewBillModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedBillId: null,
  filterMode: 'all',
  showNewBillModal: false,
  
  selectBill: (id) => set({ selectedBillId: id }),
  setFilterMode: (mode) => set({ filterMode: mode }),
  toggleNewBillModal: () => set((state) => ({ showNewBillModal: !state.showNewBillModal })),
}));

// ✅ Use React Query for remote data
export default function BillsScreen() {
  const { data: bills, isLoading } = useBills(); // From React Query hook
  const selectedBillId = useUIStore((state) => state.selectedBillId); // From Zustand UI store
  const selectBill = useUIStore((state) => state.selectBill);
  
  return (
    <FlatList
      data={bills}
      renderItem={({ item }) => (
        <BillCard
          bill={item}
          isSelected={item.id === selectedBillId}
          onPress={() => selectBill(item.id)}
        />
      )}
    />
  );
}
```

### Why This Matters
- **Simplicity**: One source of truth per data type
- **Performance**: React Query handles optimization
- **Debugging**: Easier to trace state flow
- **Maintainability**: Less boilerplate code

### Dependencies
- 🔴 **DEPENDS ON: React Query (#1)** - Must be implemented first
- ✅ **All components using Zustand** - Will need to migrate
- ✅ **Store file structure** - Can be simplified significantly

### Migration Path
1. Identify what's stored in current Zustand (use `console.log`)
2. Separate into "remote data" (move to React Query) vs "UI state" (keep in Zustand)
3. Delete remote data fetching from Zustand
4. Create React Query hooks for remote data
5. Update all components to use both

### Resources
- [Zustand Best Practices](https://github.com/pmndrs/zustand#best-practices)
- [When NOT to use Zustand](https://zustand-demo.vercel.app/)

---

## 5. Add Mutation Hooks for Data Modifications

**Priority:** 🟡 **MEDIUM**  
**Difficulty:** ⭐⭐ (Medium)  
**Estimated Time:** 4-5 hours

### What Needs to Change
When creating/updating/deleting bills, you need:
- Optimistic UI updates
- Automatic cache invalidation
- Loading/error states for the mutation
- Rollback on failure

### Current (Wrong) Approach
```javascript
// ❌ Manual state management for mutations
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleCreateBill = async (billData) => {
  setLoading(true);
  setError(null);
  try {
    await db.insert(bills).values(billData);
    // ❌ Must manually refresh data
    const updated = await db.select().from(bills);
    setBills(updated);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};
```

### Correct Approach
```javascript
// hooks/useMutationBills.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db';
import { bills } from '@/db/schema';

export function useCreateBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (billData: NewBill) => {
      const result = await db.insert(bills).values(billData).returning();
      return result[0];
    },
    onSuccess: () => {
      // ✅ Automatically invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
    onError: (error) => {
      console.error('Failed to create bill:', error);
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Bill> }) => {
      return await db.update(bills).set(data).where(eq(bills.id, id));
    },
    onMutate: async (variables) => {
      // ✅ Optimistic update - show result immediately
      await queryClient.cancelQueries({ queryKey: ['bills', variables.id] });
      
      const previousBill = queryClient.getQueryData(['bills', variables.id]);
      queryClient.setQueryData(['bills', variables.id], {
        ...previousBill,
        ...variables.data,
      });
      
      return { previousBill };
    },
    onError: (error, variables, context) => {
      // ✅ Rollback if error
      if (context?.previousBill) {
        queryClient.setQueryData(['bills', variables.id], context.previousBill);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (billId: string) => {
      return await db.delete(bills).where(eq(bills.id, billId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

// Usage in component:
export default function BillScreen() {
  const { mutate: updateBill, isPending } = useUpdateBill();
  
  const handleSave = (billData) => {
    updateBill(
      { id: billId, data: billData },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Bill updated');
          navigation.goBack();
        },
        onError: () => {
          Alert.alert('Error', 'Failed to update bill');
        },
      }
    );
  };
  
  return (
    <Button
      title={isPending ? 'Saving...' : 'Save'}
      onPress={handleSave}
      disabled={isPending}
    />
  );
}
```

### Why This Matters
- **UX**: Instant feedback on mutations
- **Resilience**: Automatic rollback on errors
- **Sync**: Cache stays synchronized automatically
- **Performance**: Optimistic updates feel instant

### Dependencies
- 🔴 **DEPENDS ON: React Query (#1)** - Must be implemented first
- ✅ **All create/update/delete operations** - Should use mutations
- ✅ **Form components** - Need to integrate with mutations

### Implementation Steps
1. Create `hooks/useMutationBills.ts` and similar files
2. Replace manual API calls with mutations
3. Add loading states to buttons
4. Test optimistic updates
5. Verify rollback works

### Resources
- [React Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

## 6. Implement TypeScript Strict Mode

**Priority:** 🟡 **MEDIUM**  
**Difficulty:** ⭐⭐ (Medium)  
**Estimated Time:** 3-4 hours

### What Needs to Change
Enable strict TypeScript checking to catch more errors at compile time.

### Current (Wrong) Approach
```typescript
// ❌ tsconfig.json with loose settings
{
  "compilerOptions": {
    "strict": false, // ❌ Allows any type
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}

// ❌ Components with implicit any
const handleBillChange = (value) => { // any type
  setBill(value);
};

// ❌ Accessing optional properties unsafely
const billName = bill.name; // Could be undefined
```

### Correct Approach
```typescript
// ✅ tsconfig.json with strict settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// ✅ Explicit types on functions
const handleBillChange = (value: Partial<Bill>) => {
  setBill(value);
};

// ✅ Safe property access
const billName = bill?.name ?? 'Untitled Bill';

// ✅ Type guards for optional data
function processBill(bill: Bill | undefined) {
  if (!bill) return null;
  return bill.name.toUpperCase(); // ✅ Safe - bill is definitely defined
}
```

### Why This Matters
- **Bug Prevention**: Catch type errors before runtime
- **IDE Support**: Better autocomplete and refactoring
- **Documentation**: Types serve as inline docs
- **Maintainability**: Future developers understand contracts

### Dependencies
- ✅ **All TypeScript files** - Will have compile errors initially
- ✅ **Library type definitions** - May need to install `@types/*` packages
- ✅ **Build process** - Will fail until errors fixed

### Implementation Steps
1. Update tsconfig.json with strict settings
2. Fix all TypeScript errors (will be many initially)
3. Add types to function parameters
4. Use type guards and null coalescing (`??`, `?.`)
5. Configure pre-commit hooks to prevent regression

### Resources
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [TypeScript Handbook - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

## 7. Add Unit Tests

**Priority:** 🟡 **MEDIUM**  
**Difficulty:** ⭐⭐⭐ (Hard)  
**Estimated Time:** 6-8 hours

### What Needs to Change
Create tests for:
- Utility functions
- Zustand/store logic
- React hooks
- Component rendering

### Current (Wrong) Approach
```javascript
// ❌ No tests - bugs discovered in production
// If you change one function, no way to know if it breaks something else
```

### Correct Approach
```bash
# Install testing tools
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest jest-mock-extended
```

```typescript
// __tests__/utils/calculateSplit.test.ts
import { calculateSplit } from '@/utils/calculateSplit';

describe('calculateSplit', () => {
  it('should split bill equally', () => {
    const result = calculateSplit({
      total: 100,
      payers: 2,
      serviceCharge: 0,
    });
    expect(result).toBe(50);
  });

  it('should include service charge', () => {
    const result = calculateSplit({
      total: 100,
      payers: 2,
      serviceCharge: 10, // 10% = $10
    });
    expect(result).toBe(55); // (100 + 10) / 2
  });

  it('should handle single payer', () => {
    const result = calculateSplit({
      total: 100,
      payers: 1,
      serviceCharge: 0,
    });
    expect(result).toBe(100);
  });

  it('should throw error for zero payers', () => {
    expect(() =>
      calculateSplit({
        total: 100,
        payers: 0,
        serviceCharge: 0,
      })
    ).toThrow('Payers must be at least 1');
  });
});

// __tests__/hooks/useBill.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useBill } from '@/hooks/useQueryBills';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('useBill', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('should fetch bill data', async () => {
    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useBill('bill-123'), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.bill.id).toBe('bill-123');
  });
});
```

### Why This Matters
- **Regression Prevention**: Catch breaking changes
- **Confidence**: Safe refactoring
- **Documentation**: Tests show how to use functions
- **Quality**: Fewer bugs in production

### Dependencies
- ✅ **All utility functions** - Should have tests
- ✅ **All hooks** - Should have tests
- ✅ **Build process** - Add `test` script to package.json

### Implementation Steps
1. Install testing libraries
2. Create `jest.config.js` for React Native
3. Write tests for utility functions first
4. Add tests for hooks
5. Add tests for components (harder)
6. Set up CI/CD to run tests

### Resources
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Guide](https://jestjs.io/docs/getting-started)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)

---

## 8. Optimize Navigation & Memory Management

**Priority:** 🟢 **LOW**  
**Difficulty:** ⭐⭐⭐ (Hard)  
**Estimated Time:** 4-5 hours

### What Needs to Change
Deep navigation stacks can cause memory leaks. Optimize by:
- Resetting navigation on completion
- Clearing component state when unmounting
- Using `useFocusEffect` for cleanup

### Current (Wrong) Approach
```javascript
// ❌ Navigation stack keeps growing
navigation.navigate('BillDetails', { id: 1 });
navigation.navigate('EditBill', { id: 1 });
navigation.navigate('AssignItems', { id: 1 });
// User has a massive stack that causes memory issues

// ❌ Subscriptions not cleaned up
useEffect(() => {
  const subscription = eventEmitter.subscribe('billUpdated', handleUpdate);
  // ❌ Never unsubscribed - memory leak
}, []);
```

### Correct Approach
```javascript
// ✅ Reset navigation after completion
const handleBillCreated = () => {
  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });
};

// ✅ Clean up subscriptions and timers
useEffect(() => {
  const subscription = eventEmitter.subscribe('billUpdated', handleUpdate);
  const timer = setTimeout(() => {
    // ...
  }, 5000);

  return () => {
    subscription.unsubscribe(); // ✅ Cleanup
    clearTimeout(timer); // ✅ Cleanup
  };
}, []);

// ✅ Use useFocusEffect for screen-specific logic
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    // This runs when screen comes into focus
    console.log('Screen focused');

    return () => {
      // This runs when screen loses focus
      console.log('Screen blurred');
    };
  }, [])
);
```

### Why This Matters
- **Performance**: Reduces memory usage over time
- **UX**: Navigation feels snappier
- **Stability**: Fewer crashes from memory issues
- **Debugging**: Easier to trace navigation flow

### Dependencies
- ✅ **Navigation structure** - Might need reorganization
- ✅ **All screens** - Should add cleanup logic
- ✅ **Custom hooks** - Should manage subscriptions

### Implementation Steps
1. Profile app with React Native debugger
2. Identify memory leaks
3. Add cleanup in `useEffect` return functions
4. Reset navigation stacks on completion
5. Test with React DevTools Profiler

### Resources
- [React Navigation Best Practices](https://reactnavigation.org/docs/troubleshooting/)
- [Memory Management in React Native](https://reactnative.dev/docs/performance#using-react-devtools-profiler-to-diagnose-performance-problems)

---

## 9. Implement Data Validation & Schemas

**Priority:** 🟢 **LOW**  
**Difficulty:** ⭐ (Easy)  
**Estimated Time:** 2-3 hours

### What Needs to Change
Validate all data with Zod schemas at:
- Database level
- API input level
- Form level

### Current (Wrong) Approach
```javascript
// ❌ No validation - accept any data
const saveBill = async (billData) => {
  await db.insert(bills).values(billData); // Might have invalid data
};
```

### Correct Approach
```typescript
// utils/schemas.ts
import { z } from 'zod';

export const BillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Bill name required').max(100),
  total: z.number().positive('Total must be positive'),
  serviceCharge: z.number().nonnegative().default(0),
  date: z.date(),
  completed: z.boolean().default(false),
});

export type Bill = z.infer<typeof BillSchema>;

export const CreateBillSchema = BillSchema.omit({ id: true, completed: true });

// hooks/useMutationBills.ts
export function useCreateBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (billData: unknown) => {
      // ✅ Validate before saving
      const validated = CreateBillSchema.parse(billData);
      const result = await db.insert(bills).values(validated).returning();
      return result[0];
    },
    onError: (error) => {
      if (error instanceof z.ZodError) {
        // ✅ Handle validation errors
        console.error('Validation failed:', error.errors);
      }
    },
  });
}

// Form component
export function CreateBillForm() {
  const { mutate, error } = useCreateBill();
  const [formData, setFormData] = useState({ name: '', total: 0 });

  const handleSubmit = () => {
    try {
      // ✅ Validate on client before server
      const validated = CreateBillSchema.parse(formData);
      mutate(validated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Show validation errors
        err.errors.forEach((error) => {
          Alert.alert('Invalid input', error.message);
        });
      }
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Bill name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        placeholder="Total"
        keyboardType="decimal-pad"
        value={String(formData.total)}
        onChangeText={(text) =>
          setFormData({ ...formData, total: parseFloat(text) })
        }
      />
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
      <Button title="Create" onPress={handleSubmit} />
    </View>
  );
}
```

### Why This Matters
- **Data Integrity**: Invalid data never enters system
- **Error Messages**: Users get specific feedback
- **Type Safety**: Schemas match TypeScript types
- **Documentation**: Schemas document data format

### Dependencies
- ✅ **All data input points** - Forms, API handlers
- ✅ **Database schema** - Should match Zod schemas

### Implementation Steps
1. Install: `npx expo install zod`
2. Create `utils/schemas.ts` with all schemas
3. Use schemas in mutations
4. Add form validation
5. Display validation errors to users

### Resources
- [Zod Documentation](https://zod.dev/)
- [Zod + React Hook Form](https://zod.dev/docs/integrations/react-hook-form)

---

## 10. Add Logging & Analytics

**Priority:** 🟢 **LOW**  
**Difficulty:** ⭐⭐ (Medium)  
**Estimated Time:** 3-4 hours

### What Needs to Change
Track app usage and errors with logging/analytics service (Sentry recommended).

### Current (Wrong) Approach
```javascript
// ❌ No visibility into errors or usage
try {
  await saveBill();
} catch (error) {
  console.log(error); // Only visible in development
}
```

### Correct Approach
```bash
# Install Sentry for React Native
npx expo install @sentry/react-native
```

```typescript
// utils/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://your-sentry-url@sentry.io/123456',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});

// Wrap your app
import { Sentry, RootLayout } from './app/_layout';

export default Sentry.wrap(RootLayout);

// Use in components
import * as Sentry from '@sentry/react-native';

export function useCreateBill() {
  return useMutation({
    mutationFn: async (billData) => {
      try {
        const result = await db.insert(bills).values(billData);
        Sentry.captureMessage('Bill created', 'info', {
          extra: { billId: result.id },
        });
        return result[0];
      } catch (error) {
        Sentry.captureException(error); // ✅ Sent to dashboard
        throw error;
      }
    },
  });
}

// Track navigation
import { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';

export function useScreenTracking() {
  const route = useRoute();
  
  useEffect(() => {
    Sentry.captureMessage(`Navigated to ${route.name}`, 'debug');
  }, [route.name]);
}
```

### Why This Matters
- **Visibility**: Know when errors occur in production
- **Debugging**: Stack traces help fix bugs
- **Analytics**: Understand user behavior
- **Performance**: Track slow operations

### Dependencies
- ✅ **All error handling** - Should use Sentry
- ✅ **Navigation** - Can track screen views
- ✅ **Mutations** - Can track important actions

### Implementation Steps
1. Create Sentry account (free tier available)
2. Install Sentry for React Native
3. Initialize in app entry point
4. Wrap error handlers with Sentry
5. Test by triggering errors

### Resources
- [Sentry for React Native](https://docs.sentry.io/platforms/react-native/)
- [Sentry Dashboards](https://docs.sentry.io/product/dashboards/)

---

## Summary: Implementation Order

```
PHASE 1 (Week 1) - Foundation:
  1. ✅ React Query (#1) - CRITICAL, enables other improvements
  2. ✅ Error Boundaries (#2) - CRITICAL, prevents crashes
  3. ✅ Loading States (#3) - HIGH, improves UX

PHASE 2 (Week 2) - Refactoring:
  4. ✅ Simplify Zustand (#4) - MEDIUM, cleanup after React Query
  5. ✅ Mutation Hooks (#5) - MEDIUM, data modification patterns
  6. ✅ TypeScript Strict (#6) - MEDIUM, catches bugs early

PHASE 3 (Week 3+) - Polish:
  7. ✅ Unit Tests (#7) - LOW, protects against regressions
  8. ✅ Navigation Optimization (#8) - LOW, performance improvement
  9. ✅ Data Validation (#9) - LOW, data integrity
  10. ✅ Logging/Analytics (#10) - LOW, production visibility
```

---

## Dependency Graph

```
React Query (#1)
├── Mutation Hooks (#5)
├── Simplify Zustand (#4)
└── Loading States (#3)

Error Boundaries (#2)
├── All async operations
└── All components

TypeScript Strict (#6)
└── Every file (can be done anytime)

Unit Tests (#7)
├── React Query completion
├── Error Boundaries
└── TypeScript Strict

Navigation Optimization (#8)
└── Can be done anytime

Data Validation (#9)
├── Mutation Hooks (#5)
└── Forms

Logging & Analytics (#10)
├── Error Boundaries (#2)
└── Can be done anytime
```

---

## Tracking Progress

Copy this to track your progress:

```markdown
## Refactor Progress

### Phase 1: Foundation
- [ ] React Query
  - [ ] Install package
  - [ ] QueryClientProvider setup
  - [ ] Create query hooks
  - [ ] Migrate components
  - [ ] Test navigation

- [ ] Error Boundaries
  - [ ] Install react-native-error-boundary
  - [ ] Create ErrorFallback component
  - [ ] Add to root layout
  - [ ] Add try/catch to functions

- [ ] Loading States
  - [ ] Create Loadable component
  - [ ] Add to all screens
  - [ ] Test with slow network

### Phase 2: Refactoring
- [ ] Simplify Zustand
- [ ] Mutation Hooks
- [ ] TypeScript Strict

### Phase 3: Polish
- [ ] Unit Tests
- [ ] Navigation Optimization
- [ ] Data Validation
- [ ] Logging & Analytics
```