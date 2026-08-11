// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    rules: {
      // 상대경로 import 금지 — 절대경로 alias(@components 등)를 사용합니다.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: '상대경로 대신 절대경로 alias(@components, @services 등)를 사용해주세요.',
            },
          ],
        },
      ],
    },
  },
]);
