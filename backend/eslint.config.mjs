import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tselint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig([
    eslint.configs.recommended,
    ...tselint.configs.recommended,

    {
        rules: {
            'prefer-const': 'error',
            'no-var': 'error',
            'no-console': 'warn',
            'no-empty-function': 'warn',
            'eqeqeq': ['error', 'always'],
        },
    },

    // Prettier integration
    {
        files: ['**/*.ts'],
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            // Run Prettier as ESLint rule
            'prettier/prettier': 'error',

            // TypeScript rules
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
        },
    },
])
