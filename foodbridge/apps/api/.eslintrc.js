// Fix: ESLint cannot resolve ".eslintrc.js" from a relative path in `extends`.
// Use a base config object structure that apps/api can properly inherit from
// by creating an eslint-config-foodbridge package, OR simply duplicate the
// rules in-app. For simplicity in a monorepo, the api-specific config
// directly lists all rules rather than extending a relative path.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // Allow console.* in server code
    'no-console': 'off',
  },
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
