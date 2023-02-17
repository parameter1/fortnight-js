module.exports = {
  extends: ['airbnb-base', 'plugin:compat/recommended'],
  plugins: [
    'compat',
    'import',
  ],
  env: {
    browser: true,
  },
  rules: {
    'import/prefer-default-export': [0],
  },
};
