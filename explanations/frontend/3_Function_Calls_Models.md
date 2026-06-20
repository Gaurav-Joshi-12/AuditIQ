# Function Calls, Models, and State Management

## 1. TypeScript Interfaces (Models)
In `src/lib/types.ts`, we define exactly what the data from our backend looks like.
For example, the `Company` interface in TypeScript exactly matches the `Company` entity / DTO in our Java backend.
This gives us strict typing — if we try to access `company.firstName` but the interface only has `company.name`, the IDE will throw an error before we even run the code.

## 2. Global State Management (Zustand)
In large React apps, passing data from parent to child (prop drilling) becomes messy. We use **Zustand** (`src/store/audit-store.ts`) as our global brain.

The store holds:
1. **State variables:** `token`, `user`, `organizations`, `submissions`.
2. **Actions (Functions):** `login()`, `loadOrganizations()`, `submitOrgData()`.

## 3. The Function Call Flow
Let's look at what happens when a user uploads a file:
1. **Component Level:** `OrgUploadPage.tsx` detects a file drop. It calls the `submitOrgData(orgId, file)` function from the store.
2. **Store Level:** The store takes the file, wraps it in `FormData` (because it's a multipart file upload, not standard JSON), and uses Axios to send it to the backend.
3. **API Level:** `api.post('/api/uploads/upload', formData)` fires.
4. **State Update:** Once the backend replies with success, the store updates its local `submissions` array.
5. **Re-render:** Because the `submissions` state changed, any React component listening to `submissions` automatically re-renders to show the new data.
