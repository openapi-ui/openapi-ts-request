module.exports = {
  arrowParens: 'always',
  singleQuote: true,
  proseWrap: 'never',
  trailingComma: 'es5',
  importOrder: ['^@?\\w', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};
