---
# System Design Document & Implementation Roadmap

## Submit-Model Web Assignment Bridge (v1.0.0)

### (This is from a "chat" with gemini, idk if ill ever get around to it.)
---

## 1. Core Architecture Strategy

1. **Host-First Data:** The mobile app handles 100% of historical memory and math (tax, tip, split processing).
2. **Deterministic Contracts:** Web views only interact with existing, pre-added database profiles—no guest registration or custom text inputs required.
3. **Transit Mailbox Engine:** The cloud database acts purely as a temporary transit mailbox. Active tables will use a 24-to-48 hour automatic self-destruct cycle (TTL).
4. **Submit-Driven Sync:** Guests click checkboxes inside mobile browser memory (`useState` + `localStorage`). Cloud row adjustments only fire once a guest clicks a final "Submit" button.

---

## 2. System Architecture Mapping

```text
┌────────────────────────┐      1. Push Snapshot        ┌─────────────────────────┐
│  Host Mobile App       ├─────────────────────────────►│  Cloud Bridge Mailbox   │
│  (React Native/Expo)   │                              │  (Supabase JSON Table)  │
└───────────┬────────────┘                              └────────────┬────────────┘
            │                                                        ▲
            │ 4. Pulls Final Snapshot                                │ 2. Downloads Init State
            │    "Nukes & Rebuilds"                                  │ 3. Appends Final Claims
            ▼                                                        ▼
┌────────────────────────┐                              ┌─────────────────────────┐
│ Local SQLite DB        │                              │  Guest Web Frontend     │
│ (Drizzle ORM Engine)   │                              │  (Vite + React + CSS)   │
└────────────────────────┘                              └─────────────────────────┘

```

---

## 3. Data Payloads

### A. Bill Structure Snapshot (`bill_data`)

_Sent from mobile to cloud when sharing link._

```json
{
  "sessionToken": "qR7x9p",
  "hostPushToken": "ExponentPushToken[xxxxx]",
  "billName": "Nando's Dinner",
  "currency": "GBP",
  "payers": [
    { "id": 101, "name": "Alex" },
    { "id": 102, "name": "Jon" },
    { "id": 103, "name": "Sarah" }
  ],
  "items": [
    { "id": 45, "name": "Half Chicken", "price": 1450, "quantity": 1 },
    { "id": 46, "name": "Large Fries", "price": 550, "quantity": 2 },
    { "id": 47, "name": "Milkshake", "price": 600, "quantity": 1 }
  ]
}
```

### B. Live Selections State (`claims_data`)

_Maintained on cloud, mutated upon web checkout submission._

```json
{
  "claims": {
    "101": [45],
    "102": [45, 47],
    "103": [46, 47]
  },
  "submittedPayers": [101, 102]
}
```

---

## 4. End-to-End Operational Lifecycle

- **Step 1 (Upload):** Host clicks share. Mobile app calculates expected counts, grabs its Expo push token, and creates a transient Supabase row matching the `bill_data` block.
- **Step 2 (The Web View):** Friends open a standard Vercel link (`/share/qR7x9p`). They select their pre-added identities, check off items, and back up clicks locally inside `localStorage` to handle unintended refreshes.
- **Step 3 (Submission Lock):** Clicking "Submit" maps arrays into the cloud row, registers identity into `submittedPayers`, and freezes the UI with a confirmation summary: _"Selections Submitted! Your host will calculate tax/tips shortly."_
- **Step 4 (Ingestion):** An edge alert triggers an Expo deep link straight onto the host's lock screen. Opening the app triggers an atomic transaction: **Nuke** existing local database pairings strictly for those incoming web users, and **Rebuild** the fresh array inputs. Any leftover shared fries or missing items are manually assigned by the owner on their own device.

---

---

## 5. Master Implementation TODO Checklist

### Phase 1: Local Mobile Schema Extensions

- [ ] Add `activeSessionToken: text("active_session_token")` to the local Drizzle `bills` table.
- [ ] Add `isWaitingOnWebClaims: integer("is_waiting_on_web_claims", { mode: "boolean" })` to the `bills` table.
- [ ] Refactor array assignment handlers in `assignItemModal.tsx` to handle array state changes as immutable copies (`[...array]`).

### Phase 2: Web Repository Framework

- [ ] Create a completely independent workspace folder and run `npm create vite@latest` selecting React + TypeScript.
- [ ] Copy your mobile app’s existing `priceUtils.ts` file directly into this new web repository.
- [ ] Install Tailwind CSS or a standard layout framework for fast mobile browser layout sizing.

### Phase 3: Cloud Provisioning

- [ ] Create a free instance account on Supabase.
- [ ] Build a single `bill_sessions` table mapping out your string token index and target JSONB payload columns.

### Phase 4: Web Application Logic

- [ ] **Onboarding Layout:** Build a view that reads incoming `bill_data.payers` from Supabase and lists them as selectable identity cards.
- [ ] **Active Checklist View:** Build a layout mapping the receipt details. Add a client-side text extractor script to generate instant three-character circle name badges (`JON`, `SJH`) instead of loading actual profile images.
- [ ] **Local State Sync:** Hook checkboxes to dynamically write current drafts out to browser `localStorage`.
- [ ] **The Submission Handler:** Add a "Submit" function that pushes mutations to `claims_data`, adds the active user ID to `submittedPayers`, and serves up a simple text summary with no raw dollar totals.

### Phase 5: Deep Linking & Ingestion Logic

- [ ] Install `expo-notifications` on the React Native mobile codebase.
- [ ] Write a notification handler listener inside your root layout component to catch notification tap events.
- [ ] Implement an explicit path router jump targeting `app/bill/[id].tsx` when a notification is clicked, passing along the `sessionToken` query param.
- [ ] **The Nuke & Rebuild Sequence:** Inside the bill detail screen, parse out incoming query parameters. Write the async merge loop that uses Drizzle to delete old `assignedItems` matching that remote user ID and inserts their newly updated selections.
- [ ] Add a clean visual warning accent color to any item in your mobile breakdown screen that remains unclaimed by the table so the owner can quickly tap and fix it manually.
