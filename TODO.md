# Groups Feature TODO

## Overview
Add group functionality to Splitshit where groups serve as templates for common payer combinations. When a group is added to a bill, its payers are copied to the bill, but additional payers can still be added independently. Payers added from a group are marked with `addedWithGroup = true`.

---

## 1. Database & Schema

- [X] **Update `bills` table**
  - Add `groupId: integer("group_id").references(() => groups.id)` (nullable)

- [X] **Fix `groupPayers` table bug**
  - Change `groupId: integer("bill_id")` → `groupId: integer("group_id")`

- [X] **Add unique constraints** (optional, but recommended)
  - Add to `billPayers`: unique on (billId, payerId)
  - Add to `groupPayers`: unique on (groupId, payerId)

- [X] **Create migration file**
  - File: `drizzle/0010_add_groups_to_bills.sql`

---

## 2. Models & Types

- [X]] **Update `Bill` type** in `models/bill.ts`
  - Add `groupId?: number` field

- [X] **Update `Payer` type** in `models/bill.ts`
  - Add `addedWithGroup?: boolean` field (calculated, not stored)

- [X] **Verify `Group` type** in `models/bill.ts`
  - Should have: `id`, `name`, `payers` array

---

## 3. Utility Functions

### Insert/Add Functions:

- [ ] **`addGroupToBill(billId, groupId)`**
  - Fetch all payers in group
  - Add each to bill with `addedWithGroup = true` (via existing addPayerToBill)
  - Set `bills.groupId = groupId`

- [ ] **`createGroupFromBill(billId, groupName)`**
  - Get all current payers from bill
  - Create new group
  - Add all payers to group
  - Set `bills.groupId = newGroupId`
  - Return new group

- [ ] **`createGroup(groupName, payerIds)`**
  - Insert group record
  - Insert all payer entries into `groupPayers`

- [ ] **Update `addPayerToBill(billId, payerId, addedWithGroup = false)`**
  - Add optional parameter for `addedWithGroup` flag
  - Default to `false` for manually added payers

### Fetch Functions:

- [ ] **`getGroupPayers(groupId)`**
  - Fetch all payers in a group

- [ ] **`getAllGroups()`**
  - Fetch all groups (for Groups tab)

- [ ] **`getGroupsByBillId(billId)`** (optional)
  - Get group associated with bill (probably just use bill.groupId directly)

### Remove/Delete Functions:

- [ ] **Add `removeGroup(groupId)` to `removeData.ts`**
  - Unlink all bills using this group (set groupId = null)
  - Delete all payers from group
  - Delete group

### Model Mapping:

- [ ] **Update `mapPayerToModel()`**
  - Calculate `addedWithGroup` by checking if payer is in bill's group
  - Return payer with `addedWithGroup` field

- [ ] **Update `mapBillToModel()`**
  - Include `groupId` in mapped bill

---

## 4. Edit Payer Modal (`editPayerModal.tsx`)

- [ ] **Add group selector at top**
  - Dropdown/list of available groups
  - Show payers that will be added

- [ ] **When group selected**
  - Fetch group payers
  - Add them all to bill automatically
  - Show group payers in list with visual indicator
  - Disable interaction on group payers

- [ ] **When group deselected**
  - Remove all payers from that group from bill
  - Keep outsiders

- [ ] **When user modifies a group payer**
  - Option B logic: Auto-deselect group, keep payers
  - Show subtle toast: "Group unselected - payers kept as independent"

- [ ] **Filter payers list**
  - Hide already-added payers
  - Show outsiders available to add

- [ ] **Visual indicator for group payers**
  - Badge, color, or icon next to name showing they're from group

---

## 5. Create Group from Bill Modal

- [ ] **Add "Create Group" button** to bill details
  - Only show if `bill.groupId === null`

- [ ] **Confirmation modal**
  - List all current payers
  - Input field for group name
  - "Create Group" and "Cancel" buttons

- [ ] **On confirm**
  - Call `createGroupFromBill(billId, groupName)`
  - Auto-assign group to bill
  - Show success toast
  - Update UI

---

## 6. Groups Tab (New Screen)

- [ ] **Create `app/(homeTabs)/groups.tsx`**
  - List all groups
  - Tap to view group details

- [ ] **Group details screen**
  - Show group name
  - List payers in group
  - Show bills using this group
  - Edit/delete options (future)

---

## 7. Home Tabs Layout Update

- [ ] **Add Groups to `app/(homeTabs)/_layout.tsx`**
  - Add tab: Groups (Bills, Payers, **Groups**)

---

## 8. Remove Payer from Bill Logic

- [ ] **When removing group payer from bill**
  - Check `addedWithGroup === true`
  - If yes, also remove `groupId` from bill
  - Show toast explaining why

---

## Testing Scenarios

- [ ] Create group, add to bill → payers appear marked
- [ ] Add outsider to bill with group → shows differently
- [ ] Modify group payer's party size → group auto-removes
- [ ] Create group from bill → group created and assigned
- [ ] Delete group → bills unlinked but payers remain
- [ ] View Groups tab → see all groups and their details
