import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';

export default [
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['tests/**'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];
