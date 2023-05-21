module.exports = {
  ignorePatterns: '*.js',
  root: true,
  env: {
    es2022: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'turbo',
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
    'no-cond-assign': 'off',
    'no-nested-ternary': 'off',
    'no-restricted-exports': 'off',
    'consistent-return': 'off',
    'no-promise-executor-return': 'off',
    'require-await': 'error',
    'max-classes-per-file': 'off',
    'default-case': 'off',
    'class-methods-use-this': 'off',
    radix: ['error', 'as-needed'],
    'no-continue': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-unresolved': 'off'
  }
};
