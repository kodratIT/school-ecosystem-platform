# STORY-006: Create @repo/ui Package

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 2  
**Story Points**: 5  
**Priority**: P1 (High)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a shared UI components library** so that **all applications can use consistent, reusable components**.

---

## 🎯 Goals

- Create @repo/ui package structure
- Implement base components (Button, Card, Input)
- Setup TypeScript types for all components
- Configure for use in Next.js apps
- Document component API

---

## ✅ Acceptance Criteria

- [ ] @repo/ui package created in packages/ui
- [ ] At least 3 base components implemented (Button, Card, Input)
- [ ] All components are TypeScript with proper types
- [ ] Components follow React best practices (forwardRef, displayName)
- [ ] Package can be imported in other workspaces
- [ ] No lint errors
- [ ] No TypeScript errors

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
# Create directories
mkdir -p packages/ui/src/components
mkdir -p packages/ui/src/lib

# Navigate to package
cd packages/ui
```

**Directory structure:**
```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── index.tsx
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

---

### Task 2: Create package.json

**Create file:** `packages/ui/package.json`

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.tsx",
  "types": "./src/index.tsx",
  "exports": {
    ".": "./src/index.tsx",
    "./components/*": "./src/components/*.tsx"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.57.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

**Key points:**
- `main` and `types` point to src (not dist) for better DX
- `exports` allows granular imports
- `peerDependencies` ensures React is provided by consumer

---

### Task 3: Configure TypeScript

**Create file:** `packages/ui/tsconfig.json`

```json
{
  "extends": "@repo/tsconfig/react.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Task 4: Configure ESLint

**Create file:** `packages/ui/.eslintrc.js`

```javascript
module.exports = {
  extends: ['@repo/eslint-config/react.js'],
};
```

---

### Task 5: Create Utils Module

**Create file:** `packages/ui/src/lib/utils.ts`

```typescript
/**
 * Merge class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
```

---

### Task 6: Create Button Component

**Create file:** `packages/ui/src/components/button.tsx`

```typescript
import * as React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    };
    
    const sizeStyles = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

**Component Features:**
- ✅ Multiple variants (primary, secondary, outline, ghost, danger)
- ✅ Multiple sizes (sm, md, lg)
- ✅ Loading state with spinner
- ✅ Full width option
- ✅ Disabled state
- ✅ ForwardRef for ref access
- ✅ TypeScript with JSDoc

---

### Task 7: Create Card Component

**Create file:** `packages/ui/src/components/card.tsx`

```typescript
import * as React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Add padding to card
   * @default true
   */
  padding?: boolean;
  
  /**
   * Add hover effect
   * @default false
   */
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = true, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-gray-200 bg-white shadow-sm',
          padding && 'p-6',
          hoverable && 'transition-shadow hover:shadow-md',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pt-0', className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-0', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
```

**Card Component Features:**
- ✅ Compound component pattern
- ✅ Flexible composition
- ✅ Optional padding
- ✅ Hoverable variant
- ✅ Semantic sub-components

---

### Task 8: Create Input Component

**Create file:** `packages/ui/src/components/input.tsx`

```typescript
import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input error state
   */
  error?: boolean;
  
  /**
   * Error message
   */
  errorMessage?: string;
  
  /**
   * Input label
   */
  label?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      errorMessage,
      label,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
        
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

**Input Component Features:**
- ✅ Label support
- ✅ Error state with message
- ✅ Helper text
- ✅ Required indicator
- ✅ Disabled state
- ✅ Auto-generated ID from label

---

### Task 9: Create Package Index

**Create file:** `packages/ui/src/index.tsx`

```typescript
// Components
export { Button, type ButtonProps } from './components/button';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
} from './components/card';
export { Input, type InputProps } from './components/input';

// Utils
export { cn, getInitials } from './lib/utils';
```

---

### Task 10: Install and Verify

```bash
# Return to root
cd ../..

# Install all workspace packages
pnpm install

# Run type check
pnpm --filter @repo/ui type-check

# Run lint
pnpm --filter @repo/ui lint
```

**Expected output:**
```
✓ Type check passed
✓ Lint passed
```

---

## 🧪 Testing Instructions

### Test 1: Verify Package Installation

```bash
# Check if package is recognized
pnpm list @repo/ui

# Should show:
# @repo/ui 0.0.0
```

### Test 2: Test Import in Another Package

Create a test file to verify imports work:

```bash
# Create temporary test file
cat > test-ui-import.tsx << 'EOF'
import { Button, Card, Input } from '@repo/ui';

export function TestComponent() {
  return (
    <Card>
      <Input label="Test" />
      <Button>Click me</Button>
    </Card>
  );
}
EOF

# Try to type-check (might fail if React not installed, that's okay)
pnpm tsc --noEmit test-ui-import.tsx

# Clean up
rm test-ui-import.tsx
```

### Test 3: Verify Component Types

```bash
# TypeScript should infer all types correctly
# Open packages/ui/src/components/button.tsx in VS Code
# Hover over Button component - should show all props
```

### Test 4: Run Package Scripts

```bash
# Type check
pnpm --filter @repo/ui type-check

# Lint
pnpm --filter @repo/ui lint

# Both should pass with no errors
```

---

## 📸 Expected Results

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx      ✅ Implemented
│   │   ├── card.tsx        ✅ Implemented
│   │   └── input.tsx       ✅ Implemented
│   ├── lib/
│   │   └── utils.ts        ✅ Implemented
│   └── index.tsx           ✅ Exports all
├── package.json            ✅ Configured
├── tsconfig.json           ✅ Configured
└── .eslintrc.js            ✅ Configured
```

**Terminal output:**
```bash
$ pnpm --filter @repo/ui type-check
✓ Type check passed

$ pnpm --filter @repo/ui lint
✓ Lint passed

$ pnpm list @repo/ui
@repo/ui 0.0.0
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@repo/tsconfig'"

**Solution:**
```bash
cd packages/config/tsconfig
pnpm install
cd ../../..
pnpm install
```

---

### Error: "React not found"

**Cause:** Missing peer dependency

**Solution:**
- React should be installed by consuming app
- For development, install in workspace root:
```bash
pnpm add -D react @types/react
```

---

### Error: "Property 'displayName' does not exist"

**Cause:** Trying to set displayName outside component

**Solution:**
- Set displayName immediately after component definition
- Example: `Button.displayName = 'Button';`

---

## 🔍 Code Review Checklist

- [ ] All components use `React.forwardRef`
- [ ] All components have `displayName` set
- [ ] All props interfaces are exported
- [ ] JSDoc comments on props
- [ ] No `any` types used
- [ ] Components are accessible (proper ARIA attributes)
- [ ] Consistent naming (PascalCase for components)
- [ ] Utils are documented

---

## 🔗 Dependencies

- **Depends on**: STORY-002 (TypeScript), STORY-003 (ESLint)
- **Blocks**: All Next.js apps (they will use these components)

---

## 📚 Resources

- [React forwardRef](https://react.dev/reference/react/forwardRef)
- [TypeScript + React](https://react-typescript-cheatsheet.netlify.app/)
- [Component Composition](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)

---

## 💡 Best Practices Applied

1. **ForwardRef** - Allows parent components to access DOM refs
2. **DisplayName** - Better debugging experience
3. **Compound Components** - Flexible composition (Card example)
4. **Prop Types** - Full TypeScript support
5. **Default Props** - Sensible defaults via destructuring
6. **Class Name Merging** - Allow custom styles via className
7. **Accessibility** - Proper labels, ARIA attributes

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] All 3 components implemented
- [ ] TypeScript types exported
- [ ] No lint errors
- [ ] No TypeScript errors
- [ ] Package can be imported
- [ ] Code reviewed
- [ ] Changes committed

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
