# TODO

## Overview
Add group functionality to Splitshit where groups serve as templates for common payer combinations. When a group is added to a bill, its payers are copied to the bill, but additional payers can still be added independently. Payers added from a group are marked with `addedWithGroup = true`.

---

## 1. Database & Schema

- [x] **Update `bills` table**
  - Add `groupId: integer("group_id").references(() => groups.id)` (nullable)

- [x] **Fix `groupPayers` table bug**
  - Change `groupId: integer("bill_id")` → `groupId: integer("group_id")`

- [x] **Add unique constraints** (optional, but recommended)
  - Add to `billPayers`: unique on (billId, payerId)
  - Add to `groupPayers`: unique on (groupId, payerId)

- [x] **Create migration file(s)**
  - File(s): `drizzle/0011_lonely_sebastian_shaw.sql`, `drizzle/0012_yielding_electro.sql`

---

## 2. Models & Types

- [x] **Update `Bill` type** in `models/bill.ts`
  - Add `groupId?: number` field

- [x] **Update `Payer` type** in `models/bill.ts`
  - Add `addedWithGroup?: boolean` field (stored in DB)

- [x] **Verify `Group` type** in `models/bill.ts`
  - Has: `id`, `name`, `description?`, `payers`, `isArchived`

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
  - [x] `insertGroup(newGroup)` exists in `insertData.ts` — inserts group row only
  - [ ] Does NOT insert payer entries into `groupPayers` — needs completing
  - [ ] Does NOT accept `payerIds` parameter

- [ ] **`insertBillPayer()` — add `addedWithGroup` parameter**
  - Currently always defaults to `false`
  - Needs to accept and persist `addedWithGroup = true` when called from `addGroupToBill`

### Fetch Functions:

- [x] **`fetchGroupPayers(groupId)`**
  - Fetch all payers in a group

- [x] **`fetchAllGroups()`**
  - Fetch all groups (for Groups tab)
  - Note: does not populate `payers` on each group (requires separate fetch)

### Remove/Delete Functions:

- [x] **Add `removeGroup(groupId)` to `removeData.ts`**
  - Archives group (soft delete), does not remove payers from it, nor unlink from bills

### Model Mapping:

- [x] **Update `mapPayerToModel()`**
  - Add `addedWithGroup` from DB
  - Return payer with `addedWithGroup` field

- [x] **Update `mapBillToModel()`**
  - Include `groupId` in mapped bill

---

## 4. Edit Payer Modal (`editBillPayersModal.tsx`)

> NOT STARTED — No group-related UI or logic implemented yet.

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
  - `addedWithGroup` is correctly stored in DB and returned by model mapper, but never used in UI

---

## 5. Create Group from Bill Modal

> NOT STARTED — `newGroup.tsx` exists but only creates a bare group by name — no payer selection, no bill linkage.

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

- [x] **Create `app/(homeTabs)/groups.tsx`**
  - Lists all groups via `fetchAllGroups()` with pull-to-refresh
  - Renders `GroupCard` in a 2-column FlatList

- [ ] **Improve `GroupCard` component**
  - Currently only shows group name — no payer count, no navigation

- [ ] **Group details screen**
  - Show group name
  - List payers in group
  - Show bills using this group
  - Edit/delete options (future)
  - Wire up `GroupCard` `onPress` to navigate here

---

## 7. Home Tabs Layout Update

- [x] **Add Groups to `app/(homeTabs)/_layout.tsx`**
  - Groups tab added as 2nd tab (Bills, **Groups**, Payers)
  - Uses `MaterialIcons` group icon with pastel green active tint

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
- [ ] Archive group → existing bills keep the group reference, archived groups no longer show for new bill creation
- [ ] View Groups tab → see all groups and their details

---
<br>

# Future Ideas

### UI & Filtering Enhancements
- [ ] Add search/filter inputs to the Bills, Payers, and Groups pages.
- [ ] Add dropdown options to Groups and Payers to:
  - View expanded details (e.g., number of bills a group is part of, detailed payer list for a group, or number of groups a payer belongs to).
  - Archive the specific payer or group.
  - See all bills associated with a payer/group (navigates to the Bills page with a pre-applied filter).

### Web UI (Self-Claiming)
- [ ] Implement web UI functionality allowing payers to claim their own items.
  - Reference: Planned out logic in [webui-blueprint.md](./webui-blueprint.md)

### Native Contact Integration (`expo-contacts`)
- [ ] Add contact search functionality for adding payers.
  - *Docs:* [Expo Contacts](https://docs.expo.dev/versions/latest/sdk/contacts/)
  - Text input for search; show matching contacts on text change.
  - UI layout: Show name large, phone/email underneath, add icon on the right.
  - Add validation to prevent adding duplicate contacts as payers.

### PDF Export & Sharing (`expo-print` & `expo-sharing`)
- [ ] Add ability to generate and share PDF summaries of bills.
  - *Docs:* [Expo Print](https://docs.expo.dev/versions/latest/sdk/print/) | [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
  - Use `Print.printToFileAsync(options)` to render and save the PDF locally.
  - Use `Share.shareAsync(options)` to open the native share sheet for the generated file.
