module.exports = {
  singleQuote: true,
  arrowParens: 'always',
  trailingComma: 'es5',
  importOrder: ['^@?\\w', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};
