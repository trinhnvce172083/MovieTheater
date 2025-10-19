// Jest setup file
import '@testing-library/jest-dom';

// Extend Jest matchers with Testing Library matchers
declare module '@jest/expect' {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveValue(value: string | number | string[]): R;
    toBeChecked(): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveClass(className: string): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toHaveFocus(): R;
    toMatchObject(object: Record<string, unknown> | unknown[]): R;
  }
}