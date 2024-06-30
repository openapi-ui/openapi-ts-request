const { generateService } = require('../dist/index');

generateService({
  schemaPath: `${__dirname}/example-files/openapi.json`,
  serversPath: './apis2/pet',
});

generateService({
  schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
  serversPath: './apis2/all',
});

generateService({
  schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
  serversPath: './apis2/app',
  apiPrefix: "'/api'",
  allowTags: ["app"] 
});
