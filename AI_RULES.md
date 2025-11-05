# AI Development Rules for CleanCity

This document outlines the rules and conventions for AI-driven development on the CleanCity project. Adhering to these guidelines ensures consistency, maintainability, and quality.

## Tech Stack Overview

The CleanCity application is a full-stack TypeScript project with a clear separation between the client and server.

- **Frontend Framework**: React with TypeScript, built using Vite.
- **Backend Framework**: Node.js with Express for the REST API.
- **Database**: PostgreSQL, accessed via the Drizzle ORM for type-safe queries.
- **UI & Styling**: Tailwind CSS for styling, with pre-built components from shadcn/ui.
- **Client-Side State**: React Query for managing server state (API data) and React hooks (`useState`) for local UI state.
- **Routing**: Wouter for client-side navigation.
- **Forms**: React Hook Form for form handling, paired with Zod for robust validation.
- **Icons**: `lucide-react` is the designated icon library.
- **Authentication**: Managed by express-session on the backend.

## Library and Convention Rules

### 1. UI and Styling

- **Component Library**: **ALWAYS** use the pre-built shadcn/ui components located in `client/src/components/ui`. Do not reinvent components like Buttons, Cards, Dialogs, Inputs, etc.
- **Styling**: **ONLY** use Tailwind CSS utility classes for styling. Custom CSS should be a last resort and added to `client/src/index.css` if absolutely necessary.
- **Icons**: **EXCLUSIVELY** use icons from the `lucide-react` package.

### 2. State Management & Data Fetching

- **Server State**: **MUST** use React Query (`@tanstack/react-query`) for all data fetching, caching, and mutations. Use the custom hooks and `queryClient` provided.
- **Client State**: For simple, non-persistent UI state within a single component, use the `useState` and `useReducer` hooks. Avoid complex global state management libraries.
- **API Requests**: All client-side API calls **MUST** use the `apiRequest` helper function from `client/src/lib/queryClient.ts`.

### 3. Forms

- **Form Logic**: **ALWAYS** use `react-hook-form` to manage form state and submissions.
- **Validation**: **MUST** use `zod` to define validation schemas for all forms. Shared schemas are located in `shared/schema.ts`.

### 4. Routing

- **Client-Side Routing**: **ONLY** use `wouter` for navigation. All application routes are defined in `client/src/App.tsx`. Use the `<Link>` component for navigation links.

### 5. Backend & Database

- **Database Access**: All database operations **MUST** be performed using the Drizzle ORM instance from `server/db.ts`. Do not write raw SQL queries directly in route handlers.
- **Schema Definitions**: Database schemas and related Zod validation schemas are defined in `shared/schema.ts`. Keep these in sync.
- **Authentication**: Routes requiring authentication **MUST** use the `requireAuth` or `requireAdmin` middleware defined in `server/routes.ts`.

### 6. Code Structure & Utilities

- **File Structure**: Maintain the existing project structure. Place new components in `client/src/components/`, pages in `client/src/pages/`, and hooks in `client/src/hooks/`.
- **Utility Functions**: Before writing new helper functions, check `client/src/lib/utils.ts` to see if a suitable utility already exists (e.g., for date formatting).