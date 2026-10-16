import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'backend/.npm-cache/**', 'backend/data/**', 'playwright-report/**', 'test-results/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['backend/**/*.{js,cjs}', 'scripts/*.mjs'],
    languageOptions: { globals: globals.node, sourceType: 'commonjs' },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': 'off',
    },
  },
  { files: ['scripts/*.mjs'], languageOptions: { sourceType: 'module' } },
  { files: ['vite.config.js'], languageOptions: { globals: globals.node } },
])
