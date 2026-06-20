# Authentication & Login Handling in the Frontend

## 1. The Goal
We need to know who the user is, ensure they are logged in before they see protected pages (like dashboards), and remember who they are even if they refresh the page.

## 2. The Flow
1. **User Submits Form:** The user enters their email and password in `AuthPage.tsx`.
2. **API Call:** The frontend sends a `POST` request to `/api/auth/login`.
3. **Backend Responds:** The backend verifies the credentials and replies with a JWT (JSON Web Token) and the user's role (`ROLE_AUDITOR` or `ROLE_ORG`).
4. **Storing the Token:** The frontend takes that token and stores it. In our app, we use **Zustand** (`audit-store.ts`) configured with `persist`, which automatically saves the token to `sessionStorage` (so it survives page refreshes).
5. **Updating UI:** The Zustand store's `isAuthenticated` flag flips to `true`, and the router navigates the user to their respective dashboard (`/auditor/dashboard` or `/org/dashboard`).

## 3. Protected Routes
In `App.tsx`, we wrap our secure pages inside an `<AppLayout>` component.
If a user tries to access `/auditor/dashboard` directly via the URL, the `AppLayout` component checks the `useAuditStore`. If `token` is null, it forcefully redirects the user back to the login page (`/auth`) using React Router's `<Navigate>` component.

## 4. Logout
When the user clicks Logout, we simply call `logout()` from our Zustand store. This function sets the `token` to null and clears the user data. The protected route logic immediately kicks in and redirects them to the login screen.
