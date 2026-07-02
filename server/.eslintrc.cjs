module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ['eslint:recommended'],
  ignorePatterns: ['node_modules', 'dist'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
};
