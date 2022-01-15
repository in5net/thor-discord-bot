module.exports = {
  ignorePatterns: '*.js',
  root: true,
  env: {
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-bitwise': 'off',
    'no-console': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-multi-assign': 'off',
    'no-return-assign': 'off',
    'no-restricted-globals': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-constant-condition': 'off',
    'no-promise-executor-return': 'off',
    'no-restricted-exports': 'off',
    'max-classes-per-file': 'off',
    radix: ['error', 'as-needed'],
    'consistent-return': 'off',
    'default-case': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
    '@typescript-eslint/no-useless-constructor': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off'
  }
};
