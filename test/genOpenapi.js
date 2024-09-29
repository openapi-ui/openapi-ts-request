const { generateService } = require('../dist/index');

generateService({
  schemaPath: 'http://10.0.0.53:7410/v2/api-docs?group=HealthCenter_API',
  serversPath: './apis/chinese-tag',
  isTranslateToEnglishTag: true
});