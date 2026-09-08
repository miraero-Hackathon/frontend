// ESLint 설정: vue3 + JavaScript 권장 규칙 + Prettier 연동
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': ['warn', { args: 'none' }],
    'no-restricted-imports': [
      'error',
      {
        patterns: ['../*'],
      },
    ],
  },
}
