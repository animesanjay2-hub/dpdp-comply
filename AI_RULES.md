# AI Rules & Tech Stack

This document outlines the technical stack and development rules for this project to ensure consistency and quality.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI)
- **Icons**: Lucide React
- **Database & Auth**: Supabase
- **Data Visualization**: Recharts
- **Utilities**: clsx, tailwind-merge, date-fns

## Development Rules

### 1. Component Architecture
- Place reusable UI components in `src/components/ui/`.
- Place feature-specific components in `src/components/`.
- Use functional components with TypeScript interfaces for props.

### 2. Routing & Pages
- Use the Next.js App Router (`src/app/`).
- Each directory in `src/app/` represents a route.
- Use `page.tsx` for the main route content and `layout.tsx` for shared layouts.

### 3. Styling
- Use Tailwind CSS utility classes for all styling.
- Avoid writing custom CSS in `globals.css` unless absolutely necessary.
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging.

### 4. Icons
- Use `lucide-react` for all icons.
- Import icons individually to keep bundle sizes small.

### 5. State Management & Data Fetching
- Use React hooks (`useState`, `useEffect`, `useMemo`) for local state.
- Use Supabase client for data fetching and authentication.
- Prefer Server Components for data fetching where possible, and Client Components for interactivity.

### 6. Code Quality
- Maintain strict TypeScript typing; avoid `any`.
- Keep components small and focused on a single responsibility.
- Follow the existing project structure and naming conventions.
