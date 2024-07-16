## Introduce

[![GitHub Repo stars](https://img.shields.io/github/stars/openapi-ui/openapi-ts-request?style=social)](https://github.com/openapi-ui/openapi-ts-request)
[![npm (scoped)](https://img.shields.io/npm/v/openapi-ts-request)](https://www.npmjs.com/package/openapi-ts-request)
![GitHub tag](https://img.shields.io/github/v/tag/openapi-ui/openapi-ts-request?include_prereleases)

English | <a href="https://github.com/openapi-ui/openapi-ts-request/blob/master/README.md">简体中文</a> 

Generate TS interfaces, request client, request mock service, enum, type field label, JSON Schemas based on [Swagger2/OpenAPI3](https://swagger.io/blog/news/whats-new-in-openapi-3-0/) specification

## Features

* support Swagger2.0/OpenAPI 3.0,3.1 specification
* generate TypeScript interface, reuquest client, request mock service, enum, type field label, JSON Schemas
* support work with npx, CLI, Nodejs
* support custom request function, Fetch、Axios、UniApp-request、Node.js、XHR client available
* support filter generate result by tags
* support JSON specification

## Usage

```bash
# npm
npm i openapi-ts-request --save-dev

# pnpm
pnpm i openapi-ts-request -D
```

### CosmiConfig

create ```openapi-ts.config.ts``` file in the project root directory
> the config file also supports ***.openapi-ts.ts***, ***openapi-ts.config.cjs*** format, reference [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig?tab=readme-ov-file#cosmiconfig)

```ts
export default {
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
}
```

support passing in array config for generate

```ts
export default [
  {
    schemaPath: 'http://app.swagger.io/v2/swagger.json',
    serversPath: './src/apis/app',
  },
  {
    schemaPath: 'http://auth.swagger.io/v2/swagger.json',
    serversPath: './src/apis/auth',
  }
]
```

add the command in ```script``` of ```package.json```: ```"openapi": "openapi-ts",```

generate result: 

```bash
npm run openapi
```

### JS

create a new ```openapi-ts.config.js``` file in any directory ```xxx/xxx```

```ts
const { generateService } = require('openapi-ts-request')

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
})
```

add the command in ```script``` of ```package.json```: ```"openapi": "node xxx/xxx/openapi-ts.config.js"```

generate result: 

```bash
npm run openapi
```

### TS

create a new ```openapi-ts.config.ts``` file in any directory ```xxx/xxx```

```ts
const { generateService } = require('openapi-ts-request')

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
})
```

add the command in ```script``` of ```package.json```: ```"openapi": "ts-node xxx/xxx/openapi-ts.config.ts",```

generate result: 

```bash
npm run openapi
```

### NPX

```bash
npx --package=openapi-ts-request -- openapi -i ./openapi.json -o ./apis
npx --package=openapi-ts-request -- openapi -i https://petstore3.swagger.io/api/v3/openapi.json -o ./apis

# pnpm
pnpm --package=openapi-ts-request@latest dlx openapi -i ./openapi.json -o ./apis
pnpm --package=openapi-ts-request@latest dlx openapi -i https://petstore3.swagger.io/api/v3/openapi.json -o ./apis
```

### CLI

```
npm i openapi-ts-request -g
```

```
$ openapi --help

  Usage: openapi [options]

  Options:
    -V, --version                      output the version number
    -i, --input <string>               OpenAPI specification, can be a path, url (required)
    -o, --output <string>              Output directory (required)
    --requestLibPath <string>          custom request lib path, for example: "@/request", "node-fetch"
    --allowedTags <string[]>           Generate results from allowed tags
    --requestOptionsType <string>      Custom request method options parameter type (default: "{ [key:
                                      string]: unknown }")
    --requestImportStatement <string>  custom request import statement, for example: "const request =
                                      require(`@/request`)"
    --apiPrefix <string>               Custom the prefix of the api path, for example: "api"(variable),
                                      `"api"`(string)
    --isDisplayTypeLabel <boolean>     Generate label matching type field (default: false) (default: false)
    --isGenJsonSchemas <boolean>       Generate JSON Schemas (default: false) (default: false)
    --mockFolder <string>              Mock file path, (default: "./mocks")
    --nullable <boolean>               null instead of optional (default: false) (default: false)
    --isCamelCase <boolean>            CamelCase naming of controller files and request client (default: true)
                                      (default: true)
    -h, --help                         display help for command
```

generate result: 

```bash
openapi -i ./spec.json -o ./apis
```

## Parameter

| props                  | required | type     | default      | remark | 
| ---------------------- | -------- | -------- | ------------ | ------- |
| schemaPath             | yes      | string   | -            | Swagger2/OpenAPI3 URL | 
| serversPath            | no       | string   | './src/apis' | the folder path for the generated results | 
| requestLibPath         | no       | string   | -            | custom request lib path, for example: '@/request', 'node-fetch' | 
| allowedTags            | no       | string[] | -            | generate results from allowed tags | 
| requestOptionsType     | no       | string   | '{ [key: string]: unknown }' | custom request method options parameter type | 
| requestImportStatement | no       | string   | -            | custom request import statement, for example: "const request = require('@/request')" | 
| apiPrefix              | no       | string   | -            | custom the prefix of the api path, for example: 'api'(variable), "'api'"(string) | 
| isDisplayTypeLabel     | no       | boolean  | false        | generate label matching type field | 
| isGenJsonSchemas       | no       | boolean  | false        | generate JSON Schemas | 
| mockFolder             | no       | string   | './mocks'    | mock file path | 
| nullable               | no       | boolean  | false        | null instead of optional | 
| isCamelCase            | no       | boolean  | true         | camelCase naming of controller files and request client | 
| hook                   | no       | [Custom Hook](#Custom-Hook) | - | custom hook | 

## Custom Hook

| props                  | type | remark            |
| ---------------------- | ---- | ----------------- |
| afterOpenApiDataInited | (openAPIData: OpenAPIObject) => OpenAPIObject  | custom OpenAPI data |
| customFunctionName     | (data: APIDataType) => string   | custom request client function name |
| customTypeName         | (data: APIDataType) => string | custom type name |
| customClassName        | (tagName: string) => string  | custom tag name |
| customType             | (<br>schemaObject: SchemaObject \| ReferenceObject,<br>namespace: string,<br>originGetType:(schemaObject: SchemaObject \| ReferenceObject, namespace: string) => string,<br>) => string  | custom type <br> *returning a non-string will use the default method to get the type* |
| customFileNames        |  (<br>operationObject: OperationObject,<br>apiPath: string,<br>apiMethod: string,<br>) => string[] | custom generate request client controller file name, can return multiple: generate multiple files. <br> *if the return value is empty, the default getFileNames is used* |

## JSON Schemas

- default generate JSON Schemas based on [components.schemas](https://spec.openapis.org/oas/latest.html#components-object), JSON Schemas corresponding to [paths](https://spec.openapis.org/oas/latest.html#paths-object) currently need to be parsed by yourself
- provide a schema parsing function to fill the references of `$ref` and `$allOf` into `current schema`

```ts
export declare function patchSchema<T extends object>(schema: ISchemaObject, schemas: ComponentsObject["schemas"]): T;
```

## Mock

currently using [mockjs](http://mockjs.com) to generate mock data, the mocks file startup needs to rely on [@umijs/server](https://umijs.org/docs/guides/mock), we will look for other solutions later to achieve a better mock experience

## Contribute

### Development Environment

* node 18+
* pnpm 9+

### Submit Pull Request

1. learn [Pull Request]("https://help.github.com/articles/using-pull-requests") specification
2. fork this repository
3. create a new branch to modify the code：`git checkout -b my-branch main`
4. make sure your code passes all test cases (new functional test cases need to be added for new features)：`pnpm test`
5. create a changeset file using the command：`pnpm changeset`
6. submit your changes using commit (must follow commitlint specification)
7. submit Pull Request

## Thanks

- [openapi2typescript](https://github.com/chenshuai2144/openapi2typescript)