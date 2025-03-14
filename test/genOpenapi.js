const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi-desc-enum.json`,
  serversPath: './apis/openapi-desc-enum',
  isSupportParseEnumDesc: true,
});
