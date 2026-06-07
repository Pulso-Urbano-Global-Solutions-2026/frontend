module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  plugins: ['import'],
  rules: {
    'import/first': 'error',
    'import/order': ['warn', { 'newlines-between': 'never' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Standard async data-fetching pattern (setState inside useCallback called from useEffect).
    // The expo preset traces setState transitively through async functions — too aggressive.
    'react-hooks/set-state-in-effect': 'off',
    // Animated.Value.interpolate() called during render is the documented RN Animated pattern.
    'react-hooks/refs': 'off',
  }
};
