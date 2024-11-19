module.exports = {
  '*.ts?(x)': ['eslint --fix --quiet'],
  '*.{ts?(x),cjs,json,md}': ['prettier --write'],
};
