import js from '@eslint/js'
import globals from 'globals'
import playwright from 'eslint-plugin-playwright'

export default [
  js.configs.recommended,
  {
    files: ['tests/**/*.js', 'tests/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.jest,
        page: 'readonly',
        browser: 'readonly',
        context: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        describe: 'readonly'
      }
    },
    plugins: {
      playwright: playwright
    },
    rules: {
      // Style
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'comma-dangle': ['error', 'never'],
      
      // Best Practices
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // Playwright specific
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-force-option': 'warn',
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/valid-expect': 'error',
      'playwright/expect-expect': 'warn',
      'playwright/no-conditional-in-test': 'warn'
    },
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**'
    ]
  }
]