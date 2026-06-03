module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  plugins: ['import'],
  rules: {
    'import/first': 'error',
    'import/order': ['warn', { 'newlines-between': 'never' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
