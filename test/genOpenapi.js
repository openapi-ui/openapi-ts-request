const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi-ref-encode-character.json`,
  serversPath: './apis/ref-encode-character',
  isTranslateToEnglishTag: true
});