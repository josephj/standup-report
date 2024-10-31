module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    indent: 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/indent': 'off',
    'node/no-unsupported-features/es-syntax': 'off', // Turn this off as we're using TypeScript
    'node/no-missing-import': 'off', // Turn this off as we're using TypeScript paths
    'node/no-unpublished-import': 'off', // Allow dev dependencies
  },
  ignorePatterns: ['dist/**', 'node_modules/**'],
};
