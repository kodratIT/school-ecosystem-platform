module.exports = {
  root: true,
  extends: ['@repo/eslint-config/base.js'],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    'coverage/',
  ],
};
