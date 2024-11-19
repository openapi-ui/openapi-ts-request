const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi-schemas-enum-array.json`,
  serversPath: './apis/schemas-enum-array',
});