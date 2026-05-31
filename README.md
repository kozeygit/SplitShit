# Splitshit (AI made the readme...)

A custom Expo-based bill splitting mobile application featuring receipt image processing, localized SQLite database management, and templates for recurring payer groups. Built for private development workflow.

## Stack & Architecture

- **Framework**: Expo (v55) with Expo Router (File-based routing)
- **State Management**: Zustand
- **Database**: SQLite (via `expo-sqlite`)
- **ORM**: Drizzle ORM + Drizzle Kit (with custom raw `.sql` file migration configuration)
- **Forms**: React Hook Form + Zod validation
- **Animations**: React Native Reanimated (v4)
- **UI & Theme**: Custom geometric, multi-colored layout utilizing a dedicated `Colors.ts` pastel system

## Project Structure

```text
├── app/                      # Expo Router Navigation Layouts
│   ├── (homeTabs)/           # Tab Bar: Bills, Payer Profiles, Group Templates
│   ├── (billTabs)/           # Active Workspace: Items, Allocations, Breakdown, OCR View
│   ├── (assignModals)/       # Quick-assign item assignment interfaces
│   ├── (billModals)/         # Item editing & metadata detail modifiers
│   └── (newModals)/          # Forms to append new data entities
├── components/               # Atomic Design UI Components
│   ├── bill/, group/, payer/ # Feature-specific visualization cards and selectors
│   └── ui/                   # Global components (FAB elements, Row structures, Toggles)
├── db/                       # Drizzle local SQLite relational schema logic
├── drizzle/                  # Auto-generated incremental migration Snapshots and raw SQL
├── hooks/                    # Context hooks (Global store subscriptions, camera access)
├── models/                   # Type declarations mapped against logic variables
└── utils/                    # Data manipulation algorithms, parser utils & math formatters

```

## Development Operations

### Prerequisites

Ensure you have your global Expo environment variables or active dev client tools ready.

1. **Install dependencies:**
```bash
npm install

```

2. **Database Management (Drizzle Kit):**
* Generate new SQLite snapshots after schema alterations:
```bash
npx drizzle-kit generate

```

3. **Start the local Metro Bundler server:**
```bash
npx expo start

```

## Roadmap & Active Engineering (`TODO.md`)

* [x] Migrated Drizzle Schema relations to isolate `billPayers` and `groupPayers` dynamically.
* [x] Standardized local pricing calculations to handle integer cent values securely (`Price.ts`).
* [ ] Implement group-assignment selectors inside `editBillPayersModal.tsx`.
* [ ] Connect `createGroupFromBill` mechanism within active workspace contexts.
* [ ] Optimize the OCR pipeline helper engine inside `createBillFromImage.ts`.
