---
trigger: always_on
---

## TypeScript Coding Standard

This document outlines the official TypeScript coding standards for all Vue.js and Nuxt projects. The goal is to create code that is consistent, readable, and maintainable. Adherence to these standards is mandatory and will be enforced by automated tooling.

### 1. Tooling & Strictness

- **Compiler Strictness**: The project's `tsconfig.json` **must** have `strict: true` enabled to catch as many potential errors as possible at compile time.
- **Linter & Formatter**: **ESLint** and **Prettier** are used to enforce code quality and a consistent format. All developers must use the provided configuration and enable "format on save" in their editors. A pre-commit hook will run to ensure compliance.
- **The `any` Type**: The use of `any` is strongly discouraged. When its use is unavoidable (e.g., interacting with a third-party library without types), it **must** be accompanied by a comment explaining the reason.

````typescript
    // TODO: Remove `any` when the `untyped-library` provides official types.
    function processData(data: any) {
      // ...
    }
    ```

-----

### 2. Naming Conventions

  * **Variables & Functions**: Use `camelCase`.
      * `const userProfile = {};`
      * `function getUserProfile() {}`
  * **Classes, Interfaces & Type Aliases**: Use `PascalCase`.
      * `class ApiService {}`
      * `interface UserProfile {}`
      * `type UserId = string;`
  * **Constants**: For truly immutable, globally-scoped constants (like configuration values), use `UPPER_SNAKE_CASE`. For all other `const` declarations, use `camelCase`.
      * `const MAX_LOGIN_ATTEMPTS = 5;`
      * `const user = await fetchUser();`
  * **Interface Prefix**: Do **not** prefix interfaces with `I-`. Use `UserProfile`, not `IUserProfile`.
  * **File Names**:
      * Vue Components: `PascalCase.vue` (e.g., `UserProfileCard.vue`)
      * All other TypeScript files: `kebab-case.ts` (e.g., `api-client.ts`, `string-utils.ts`)

-----

### 3. Typing Philosophy

  * **`interface` vs. `type`**:
      * Use `interface` for defining the shape of objects or classes.
      * Use `type` for all other cases, such as defining primitive aliases, unions, or intersections.
        ```typescript
        interface Product {
          id: string;
          name: string;
        }

        type ProductStatus = "available" | "out-of-stock";
        ```
  * **Enums**: Do **not** use `enum`. Use `as const` on a plain object to create a set of string constants. This is more tree-shakeable and transparent.
    ```typescript
    // Use this:
    export const UserRole = {
      Admin: "ADMIN",
      Editor: "EDITOR",
      Viewer: "VIEWER",
    } as const;

    // Optional: creates the union type from the object's values
    type UserRole = typeof UserRole[keyof typeof UserRole];
    ```
  * **Type Inference**: Rely on TypeScript's inference for simple, immediately-assigned variables. However, all function parameters and return types **must** be explicitly typed.
    ```typescript
    // Good: Inference is clear
    const name = "Alice";

    // Good: Explicit types for function signature
    function greet(user: string): string {
      return `Hello, ${user}!`;
    }
    ```

-----

### 4. Code & File Organization

  * **Path Aliases**: Always use path aliases configured in `tsconfig.json` for imports outside of the current feature directory (e.g., `import UserService from '@/services/user.service'`).
  * **Import Order**: Imports will be automatically sorted and grouped by an ESLint plugin. The standard order is: 1. External packages, 2. Internal aliases (`@/`), 3. Relative paths (`../`).
  * **Exports**: Use `export default` for the primary export of a file (e.g., a component, class, or service). Use named exports (`export`) for any secondary or helper functions in the same file.
    ```typescript
    // file: user.service.ts

    // Primary export
    export default class UserService {
      // ...
    }

    // Secondary helper export
    export function isValidUser(user: unknown): boolean {
      // ...
    }
    ```

-----

### 5. Comments & Documentation

  * **JSDoc for Exported Members**: All exported functions, classes, and complex types **must** have a JSDoc block. JSDoc allows IDEs to provide rich tooltips and auto-completion, making the code easier to use correctly.
  * **Inline Comments**: Inline comments should be used to explain *why* a piece of complex or non-obvious code exists, not *what* it does. The code itself should be self-explanatory.

#### JSDoc Example

A proper JSDoc comment describes the function's purpose, details each parameter with `@param`, and specifies the return value with `@returns`.

```typescript
/**
 * Calculates the final price of an item after applying a discount.
 *
 * @param price - The original price of the item. Must be a positive number.
 * @param discountPercentage - The discount to apply, as a whole number (e.g., 15 for 15%).
 * @returns The final price after the discount is applied.
 */
export function calculateFinalPrice(price: number, discountPercentage: number): number {
  if (price <= 0 || discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Invalid input for price or discount.");
  }

  const discountAmount = price * (discountPercentage / 100);
  return price - discountAmount;
}
````