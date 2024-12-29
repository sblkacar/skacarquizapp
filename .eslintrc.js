module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    'react/prop-types': 'error',
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  }
} 