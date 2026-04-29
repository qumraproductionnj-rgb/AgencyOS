// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Inherited scaffolding from prior setup — to be reviewed and re-enabled
    // when each workspace's task lands (0.4 api, 0.5 web, 0.6 database).
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/prisma/migrations/**',
      '*.config.{js,cjs,mjs}',
      'apps/api/**',
      'apps/web/**',
      'packages/database/**',
      'packages/shared/**',
    ],
  },
)
