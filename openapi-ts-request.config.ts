import { type GenerateServiceProps } from './src/index';

export default [
  {
    schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
    serversPath: './apis/app',
  },
] as GenerateServiceProps[];
