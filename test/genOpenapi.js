const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi-response-desc.json`,
  serversPath: './apis/openapi-response-desc',
  isSupportParseEnumDesc: true,
});
