# API Handling in the Frontend

To talk to the Spring Boot backend, we don't use the raw `fetch()` API. Instead, we use a powerful library called **Axios**.

## 1. The Axios Instance (`api.ts`)
We created a centralized Axios instance in `src/lib/api.ts`.
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8082' // The backend URL
});
```
This means we never have to type the full URL in our components, just `api.get('/api/companies')`.

## 2. Axios Interceptors (The Secret Sauce)
Because our backend is secured with JWT, every single request we make needs to have an `Authorization: Bearer <token>` header.
Instead of manually adding this to every API call, we use an **Axios Interceptor**.

An interceptor "intercepts" the request right before it leaves the browser.
```typescript
api.interceptors.request.use((config) => {
    const token = useAuditStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});
```
This guarantees that if the user is logged in, their token is securely attached to the request headers.

## 3. Handling Responses
When we call the backend (e.g., `api.post(...)`), Axios returns a Promise. We use `async/await` syntax to wait for the data. If the backend returns an error (like a 400 Bad Request or 403 Forbidden), Axios throws an error, which we catch using a `try/catch` block and display a beautiful toast notification to the user.
