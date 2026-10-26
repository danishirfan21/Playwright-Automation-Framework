import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'blob-report/', 'test-results/', 'playwright/.auth/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts', 'fixtures/**/*.ts', 'pages/**/*.ts'],
    rules: {
      // Assertions live in page-object `expect*` methods, so count those as assertions.
      'playwright/expect-expect': [
        'warn',
        { assertFunctionNames: ['expect'], assertFunctionPatterns: ['^expect[A-Z]'] },
      ],
    },
  },
);
