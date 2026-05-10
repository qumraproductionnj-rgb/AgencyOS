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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // consistent-type-imports is disabled because it conflicts with NestJS DI:
      // auto-fix converts constructor param types (e.g. ConfigService) to type-only
      // imports, breaking emitDecoratorMetadata-driven dependency injection at runtime.
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
      'apps/web/.next/**',
      'apps/web/next-env.d.ts',
      'apps/web/public/sw.js',
      'apps/web/public/workbox-*.js',
      'packages/database/dist/**',
      'packages/database/prisma/migrations/**',
      'packages/database/src/*.js',
      'packages/database/src/*.mjs',
      'packages/shared/**',
    ],
  },
)
