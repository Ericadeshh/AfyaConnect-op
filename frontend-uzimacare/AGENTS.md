# AGENTS.md - Uzimacare Healthcare Management System

This document provides essential information for agentic coding assistants working on the Uzimacare project, a Next.js-based healthcare application for TB patient management and inter-facility referrals in Kenya.

## Project Overview

Uzimacare is a TypeScript React application built with Next.js 16 that manages TB patient care, physician referrals, appointment bookings, and mobile payments. It supports three user roles: patients, physicians, and administrators.

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development server on localhost:3000
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint (currently not configured - will fail)
```

### Testing
**No testing framework is currently configured.** To run tests in the future:
```bash
npm test             # Run test suite (when implemented)
npm run test:watch   # Run tests in watch mode (when implemented)
npm run test:e2e     # Run end-to-end tests (when implemented)
```

To run a single test file (when testing is implemented):
```bash
npm test -- path/to/test-file.test.ts
npm test -- --testNamePattern="exact test name"
```

## Code Style Guidelines

### Framework & Language
- **Next.js 16** with App Router
- **TypeScript** with `strict: false` (loose typing allowed)
- **React 19** with functional components and hooks
- **Tailwind CSS v4** for styling

### File Structure
```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles (Tailwind v4)
├── components/            # React components
│   ├── ui/               # UI components (basic shadcn/ui-style components)
│   │   ├── button.tsx    # Button component with variants
│   │   └── card.tsx      # Card component
│   ├── auth/             # Authentication components
│   ├── admin/            # Admin dashboard components
│   ├── physician/        # Physician dashboard components
│   └── patient/          # Patient dashboard components
├── lib/                  # Utility libraries
│   ├── types.ts          # TypeScript type definitions
│   ├── db.ts             # Mock database (in-memory storage)
│   ├── auth.ts           # Authentication logic
│   ├── payment.ts        # M-Pesa payment integration
│   ├── notifications.ts  # Notification system
│   ├── storage.ts        # Local storage utilities
│   ├── utils.ts          # Utility functions (cn for class merging)
│   └── reminders.ts      # Reminder system
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

### Component Patterns

#### Client Components
All interactive components use `"use client"` directive:
```tsx
"use client";

import { useState } from "react";

export default function MyComponent() {
  const [state, setState] = useState(null);
  // Component logic
}
```

#### Import Organization
```tsx
// External libraries first
import { useState, useEffect } from "react";

// UI components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Local components
import NotificationBell from "../notifications/notification-bell";

// Utility imports
import { db } from "@/lib/db";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
```

#### Path Mapping
- Use `@/` prefix for absolute imports (configured in tsconfig.json)
- Import UI components from `@/components/ui/*`
- Import utilities from `@/lib/*`

### TypeScript Guidelines

#### Type Definitions
- Use strict typing for data models in `lib/types.ts`
- Define interfaces for component props
- Use union types for status fields and enums

#### Interface Naming
```tsx
interface ComponentNameProps {
  user: User;
  onAction: (data: any) => void;
}

export default function ComponentName({ user, onAction }: ComponentNameProps) {
  // Implementation
}
```

#### Type Safety
- Avoid `any` types when possible (currently used in some places)
- Use proper typing for API responses and database operations
- Define return types for utility functions

### Styling Conventions

#### Tailwind CSS v4
- Use utility-first approach
- Custom CSS variables defined in `globals.css`
- Responsive design with `md:`, `lg:` prefixes
- Color scheme supports light/dark themes

#### Component Styling
```tsx
<div className="bg-surface">
  <header className="bg-accent text-white py-6 shadow-lg">
    <div className="max-w-7xl mx-auto px-4">
      {/* Content */}
    </div>
  </header>
</div>
```

### State Management

#### Local State
- Use `useState` for component-level state
- Use `useEffect` for side effects and API calls
- **IMPORTANT**: Do not use `useState` with functions for side effects - use `useEffect` instead

#### Data Storage
- Mock database in `lib/db.ts` (in-memory Map objects)
- Local storage utilities in `lib/storage.ts`
- No global state management library (use React context if needed)

### API Integration

#### Database Operations
- All database operations are currently mocked
- Use in-memory storage with Map objects
- Future: Replace with Supabase or similar backend

#### Payment Integration
- M-Pesa STK Push integration in `lib/payment.ts`
- Handles mobile money payments for appointments

### Error Handling

#### Component Level
```tsx
try {
  // Operation
} catch (error) {
  console.error("Operation failed:", error);
  // Handle error (show toast, fallback UI, etc.)
}
```

#### Form Validation
- Use React Hook Form with Zod validation
- Client-side validation before API calls

### Security Considerations

#### Authentication
- Role-based access control (patient, physician, admin)
- Token-based authentication (JWT expected)
- Secure local storage for auth state

#### Data Protection
- No sensitive data logging in console
- Secure handling of payment information
- Proper input validation and sanitization

### Code Quality Standards

#### Naming Conventions
- **Components**: PascalCase (e.g., `PatientDashboard`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Variables**: camelCase (e.g., `userData`)
- **Types**: PascalCase (e.g., `UserRole`)
- **Files**: kebab-case (e.g., `booking-details.tsx`)

#### File Organization
- One component per file
- Related utilities in separate files
- Type definitions centralized in `lib/types.ts`

#### Comments
- Use JSDoc for complex functions
- Avoid unnecessary comments (self-documenting code preferred)
- Comment complex business logic

### Development Workflow

#### Component Development
1. Create component file in appropriate directory
2. Add TypeScript interfaces for props
3. Implement component logic
4. Add proper error handling
5. Test component integration

#### Feature Implementation
1. Update type definitions if needed
2. Implement backend logic in `lib/`
3. Create/update components
4. Update database mock data
5. Test end-to-end flow

### Dependencies to Note

#### UI Components
The project includes basic shadcn/ui-style components:
- `@/components/ui/card` - Basic card component with rounded corners and shadow
- `@/components/ui/button` - Button component with variants (default, destructive, outline, secondary, ghost, link) and sizes

#### Key Libraries
- `react-hook-form` + `@hookform/resolvers/zod` for forms
- `zod` for validation
- `date-fns` for date handling
- `lucide-react` for icons
- `@radix-ui/*` for headless UI components
- `recharts` for data visualization
- `clsx` + `tailwind-merge` for class name utilities

### Environment Setup

#### Required Tools
- Node.js (LTS version)
- npm or yarn
- Git

#### Development Setup
```bash
git clone <repository>
npm install
npm run dev
```

### Current Issues & Fixes Needed

#### TypeScript Errors
- **All TypeScript errors resolved** ✅
- Previously: `referrals-list.tsx:24` had incorrect use of `useState` with function and dependency array
- **FIXED**: Replaced `useState` with `useEffect` for side effects

### Testing Setup (Future)

When implementing tests, use:
- **Jest** + **React Testing Library** for unit/component tests
- **Playwright** or **Cypress** for E2E tests
- Test files: `*.test.tsx` or `*.spec.tsx`

### Deployment

#### Build Process
```bash
npm run build  # Creates optimized production build
npm run start  # Serves production build
```

#### Environment Variables
- Configure environment variables for production
- Separate dev/staging/production environments

### Performance Considerations

#### Optimization
- Use Next.js Image component for images
- Implement proper loading states
- Optimize bundle size (tree shaking)
- Use React.memo for expensive components

#### Monitoring
- Vercel Analytics configured
- Monitor Core Web Vitals
- Track user interactions and errors

### Accessibility

#### Standards
- Use semantic HTML elements
- Proper ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

### Future Enhancements

#### Planned Features
- Real database integration (Supabase/PostgreSQL)
- Real-time notifications
- Advanced reporting and analytics
- Mobile app development
- Multi-language support
- Offline functionality

#### Technical Debt
- Fix TypeScript errors (useState vs useEffect misuse)
- Replace mock database with real backend
- Implement proper error boundaries
- Add comprehensive test coverage
- Set up CI/CD pipeline
- Implement proper logging and monitoring

---

This document should be updated as the project evolves. When making changes to the codebase, ensure compliance with these guidelines and update this document accordingly.</content>
<parameter name="filePath">AGENTS.md