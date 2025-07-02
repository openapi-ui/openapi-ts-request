module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  ignorePatterns: [
    'dist',
    'node_modules',
    'test',
    '*.cjs',
    'openapi-ts-request.config.ts',
    'vitest.config.ts',
  ],
  plugins: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
  },
};
