const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi-chinese-tag.json`,
  serversPath: './apis/chinese-tag',
  isTranslateToEnglishTag: true
});