import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      // JSX A11y rules - selectively applied
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error', 
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // React specific rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // We use TypeScript for prop validation
      'react/no-unescaped-entities': 'off', // Allow unescaped quotes in JSX
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      // JSX A11y rules - more lenient for development
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      // React Refresh - only warn for violations
      'react-refresh/only-export-components': 'warn',
      // General JS/TS rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn', // Warn instead of error for development
      'prefer-const': 'error',
      'no-var': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
)
