import 'vitest'
import '@testing-library/jest-dom/vitest'

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T>, CustomMatchers<T> {}
  interface CustomMatchers<R = any> {
    toBeInTheDocument(): R
    toHaveAttribute(attr: string, value?: string): R
    toHaveClass(className: string): R
    toHaveTextContent(text: string | RegExp): R
  }
}
