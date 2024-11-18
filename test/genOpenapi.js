const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi.json`,
  serversPath: './apis/only-generate-typescript-type',
  isOnlyGenTypeScriptType: true,
});