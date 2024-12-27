const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi.json`,
  serversPath: './apis/react-query',
  isGenReactQuery: true,
});