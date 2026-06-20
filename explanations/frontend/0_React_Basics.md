# React Basics & Tools used in AuditIQ

## 1. What is React?
React is a JavaScript library for building user interfaces. Instead of manipulating the DOM directly (which is slow), React uses a **Virtual DOM**. It breaks the UI down into reusable, isolated pieces called **Components**.

## 2. Components
In AuditIQ, everything you see is a component.
- **Functional Components:** We use modern functional components (e.g., `const Dashboard = () => { return <div>...</div> }`).
- **Props:** Data passed from a parent component down to a child component (e.g., passing `companyId` to a `Chart` component).

## 3. React Hooks
Hooks allow functional components to hook into React state and lifecycle features.
- **`useState`**: Used to declare local state variables. In `AIChatbot.tsx`, we use `const [input, setInput] = useState('')` to keep track of what the user is typing in the chat box. When `setInput` is called, React re-renders just that component.
- **`useEffect`**: Used for side effects (like fetching data, manually manipulating the DOM, or setting up subscriptions). In our app, we use it to automatically scroll the chat window to the bottom whenever a new message arrives.
- **Custom Hooks**: We use Zustand (`useAuditStore`) as a custom hook to access global state across our entire app without prop-drilling.

## 4. Vite vs Create-React-App (CRA)
We used **Vite** to scaffold and build this project instead of the older Create-React-App.
- **Why Vite?** It is insanely fast. It uses native ES modules during development so the server starts instantly, and it uses Rollup for production builds.

## 5. NPM vs Bun
- **NPM (Node Package Manager)**: The standard package manager for JavaScript.
- **Bun**: We actually use Bun in our Docker container! Bun is a newer, incredibly fast all-in-one JavaScript runtime and package manager. It installs dependencies up to 30x faster than NPM.
