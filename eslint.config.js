import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', "**/routeTree.**", './src/api/generated']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars'  : 'error',
      '@typescript-eslint/no-explicit-any' : 'warn',
      'no-console'                         : 'error',
      'no-multiple-empty-lines'            : ['error', { max : 1, maxEOF : 0 }],
      'react/react-in-jsx-scope'           : 'off',
      'react/jsx-max-props-per-line'       : [1, { maximum : 1 }],
      'react/jsx-closing-bracket-location' : 1,
      'key-spacing'                        : [
        'error',
        {
          align       : 'colon',
          beforeColon : true,
          afterColon  : true,
        },
      ],
      'brace-style'   : 'error',
      indent          : ['error', 2],
      'comma-spacing' : [
        'error',
        {
          before : false,
          after  : true,
        },
      ],
      'space-in-parens'                 : ['error', 'always'],
      'padding-line-between-statements' : [
        'error',
        {
          blankLine : 'always',
          prev      : 'var',
          next      : 'return',
        },
      ],
      'newline-before-return' : 'error',
      'object-curly-spacing'  : ['error', 'always'],
    },
  },
  {
    // TanStack Router file routes export both `Route` and a component.
    files : ['src/routes/**/*.{ts,tsx}'],
    rules : {
      'react-refresh/only-export-components' : 'off',
    },
  },
])
