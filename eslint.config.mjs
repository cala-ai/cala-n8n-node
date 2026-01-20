import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/', 'node_modules/', '**/*.test.ts'] },
  {
    files: ['nodes/**/*.ts', 'credentials/**/*.ts'],
    ...eslint.configs.recommended,
  },
  ...tseslint.configs.recommended,
];
