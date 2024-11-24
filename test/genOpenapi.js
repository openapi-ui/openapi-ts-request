const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi-test-allof-api.json`,
  serversPath: './apis/allof',
  isDisplayTypeLabel: true,
});