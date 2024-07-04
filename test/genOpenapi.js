const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi.json`,
  serversPath: './apis/pet',
});

generateService({
  schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
  serversPath: './apis/all',
});

generateService({
  schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
  serversPath: './apis/app',
  apiPrefix: "'/api'",
  allowTags: ["app"] 
});
