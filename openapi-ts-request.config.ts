import { defineConfig } from './src/index';

export default defineConfig([
  {
    schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
    serversPath: './apis/app',
    describe: 'Petstore API-1',
  },
  {
    schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
    serversPath: './apis/app2',
    describe: 'Petstore API-2',
  },
]);
