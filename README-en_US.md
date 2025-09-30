## Introduce

[![GitHub Repo stars](https://img.shields.io/github/stars/openapi-ui/openapi-ts-request?style=social)](https://github.com/openapi-ui/openapi-ts-request) [![npm (scoped)](https://img.shields.io/npm/v/openapi-ts-request)](https://www.npmjs.com/package/openapi-ts-request) ![GitHub tag](https://img.shields.io/github/v/tag/openapi-ui/openapi-ts-request?include_prereleases)

English | <a href="https://github.com/openapi-ui/openapi-ts-request/blob/master/README.md">简体中文</a>

based on [Swagger2/OpenAPI3/Apifox](https://swagger.io/blog/news/whats-new-in-openapi-3-0/) specification Generate

- TypeScript/JavaScript
- request client(support any client)
- request mock service
- enum and enum translation
- react-query/vue-query
- type field label
- JSON Schemas
- Apifox Config

docs：[use docs](https://github.com/openapi-ui/openapi-ts-request/issues/100)

## Features

- support Swagger2.0/OpenAPI/Apifox 3.0,3.1 specification
- generate TypeScript/JavaScript, reuquest client(support any client), request mock service, enum and enum translation, react-query/vue-query, type field label, JSON Schemas
- support work with npx, CLI, Nodejs
- support custom request function, Fetch、Axios、[UniApp-request](https://github.com/openapi-ui/openapi-ts-request/issues/46)、Taro-Request、Node.js、XHR client available
- support filter generate result by tags
- support JSON/YAML specification
- support translate chinese tag name to english tag name
- support direct configuration of `apifox` `token` and `projectId` direct generation

## Usage

```bash
# npm
npm i openapi-ts-request --save-dev

# pnpm
pnpm i openapi-ts-request -D
```

### CosmiConfig

create `openapi-ts-request.config.ts` file in the project root directory

> the config file also supports **_.openapi-ts-request.ts_**, **_openapi-ts-request.config.cjs_** format, reference [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig?tab=readme-ov-file#cosmiconfig)

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default {
  // schemaPath: './openapi.json', // local openapi file
  // serversPath: './src/apis', // interface storage path
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
} as GenerateServiceProps;
```

support passing in array config for generate

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'http://app.swagger.io/v2/swagger.json',
    serversPath: './src/apis/app',
  },
  {
    schemaPath: 'http://auth.swagger.io/v2/swagger.json',
    serversPath: './src/apis/auth',
  },
] as GenerateServiceProps[];
```

add the command in `script` of `package.json`: `"openapi": "openapi-ts",`

run:

```bash
npm run openapi
```

run:

```bash
src/apis/index.ts #interface entry file
src/apis/types.ts #type definition file
src/apis/app #app interface
```

```typescript
// src/apis/pet.ts
/* eslint-disable */
// @ts-ignore
import request from 'axios';

import * as API from './types';

/** Update an existing pet PUT /pet */
export async function updatePet({
  body,
  options,
}: {
  body: API.Pet;
  options?: { [key: string]: unknown };
}) {
  return request<unknown>(`/pet`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

// ... more interfaces
```

### JS

create a new `openapi-ts-request.config.js` file in any directory `xxx/xxx`

```ts
const { generateService } = require('openapi-ts-request');

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
});
```

add the command in `script` of `package.json`: `"openapi": "node xxx/xxx/openapi-ts-request.config.js"`

run:

```bash
npm run openapi
```

### TS

create a new `openapi-ts-request.config.ts` file in any directory `xxx/xxx`

```ts
const { generateService } = require('openapi-ts-request');

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
});
```

add the command in `script` of `package.json`: `"openapi": "ts-node xxx/xxx/openapi-ts-request.config.ts",`

run:

```bash
npm run openapi
```

### NPX

```bash
# npm
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
    -V, --version                       output the version number
    -i, --input <string>                OpenAPI specification, can be a path, url
    -o, --output <string>               output directory
    -cfn, --configFileName <string>     config file name
    -cfp, --configFilePath <string>     config file path
    -u, --uniqueKey <string>            unique key
    --requestLibPath <string>           custom request lib path, for example: "@/request", "node-fetch" (default: "axios")
    -f, --full <boolean>                full replacement (default: true)
    --enableLogging <boolean>           open the log (default: false)
    --priorityRule <string>             priority rule, include/exclude/both (default: "include")
    --filterCaseInsensitive <boolean>   whether to perform a case-insensitive match with includeTags, includePaths, excludeTags, excludePaths filters (default: false)
    --includeTags <(string|RegExp)[]>   generate code from include tags
    --includePaths <(string|RegExp)[]>  generate code from include paths
    --excludeTags <(string|RegExp)[]>   generate code from exclude tags
    --excludePaths <(string|RegExp)[]>  generate code from exclude paths
    --requestOptionsType <string>       custom request method options parameter type (default: "{ [key: string]: unknown }")
    --requestImportStatement <string>   custom request import statement, for example: "const request = require('@/request')"
    --apiPrefix <string>                custom the prefix of the api path, for example: "api"(variable), "'api'"(string)
    --isGenReactQuery <boolean>         generate react-query (default: false)
    --reactQueryMode <string>           react-query mode, react/vue (default: "react")
    --isGenJavaScript <boolean>         generate JavaScript (default: false)
    --isDisplayTypeLabel <boolean>      generate label matching type field (default: false)
    --isGenJsonSchemas <boolean>        generate JSON Schemas (default: false)
    --mockFolder <string>               mock file path, for example: './mocks'
    --authorization <string>            docs authorization
    --nullable <boolean>                null instead of optional (default: false)
    --isTranslateToEnglishTag <boolean> translate chinese tag name to english tag name (default: false)
    --isOnlyGenTypeScriptType <boolean> only generate typescript type (default: false)
    --isCamelCase <boolean>             camelCase naming of controller files and request client (default: true)
    --isSupportParseEnumDesc <boolean>  parse enum description to generate enum label (default: false)
    -h, --help                          display help for command
```

run:

```bash
openapi -i ./spec.json -o ./apis
```

## Parameter

| props | required | type | default | remark |
| --- | --- | --- | --- | --- |
| schemaPath | yes | string | - | Swagger2/OpenAPI3 URL |
| serversPath | no | string | './src/apis' | the folder path for the run results |
| requestLibPath | no | string | 'axios' | custom request lib path, for example: '@/request', 'node-fetch' |
| full | no | boolean | true | full replacement |
| enableLogging | no | boolean | false | open the log |
| priorityRule | no | string | 'include' | priority rule, include/exclude/both |
| filterCaseInsensitive | no | boolean | false | whether to perform a case-insensitive match with includeTags, includePaths, excludeTags, excludePaths filters |
| includeTags | no | (string\|RegExp)[] | - | generate code from include tags, priorityRule=include required |
| includePaths | no | (string\|RegExp)[] | - | generate code from include paths |
| excludeTags | no | (string\|RegExp)[] | - | generate code from exclude tags |
| excludePaths | no | (string\|RegExp)[] | - | generate code from exclude paths |
| requestOptionsType | no | string | '{ [key: string]: unknown }' | custom request method options parameter type |
| requestImportStatement | no | string | - | custom request import statement, for example: "const request = require('@/request')" |
| apiPrefix | no | string | - | custom the prefix of the api path, for example: 'api'(variable), "'api'"(string) |
| isGenReactQuery | no | boolean | false | generate react-query |
| reactQueryMode | no | string | 'react' | react-query mode, react/vue |
| isGenJavaScript | no | boolean | false | generate JavaScript |
| isDisplayTypeLabel | no | boolean | false | generate label matching type field |
| isGenJsonSchemas | no | boolean | false | generate JSON Schemas |
| mockFolder | no | string | - | mock file path, for example: './mocks' |
| authorization | no | string | - | docs authorization |
| apifoxConfig | no | [Apifox Config](#Apifox-Config) | - | apifox configs |
| nullable | no | boolean | false | null instead of optional |
| isTranslateToEnglishTag | no | boolean | false | translate chinese tag name to english tag name |
| isOnlyGenTypeScriptType | no | boolean | false | only generate typescript type |
| isCamelCase | no | boolean | true | camelCase naming of controller files and request client |
| isSupportParseEnumDesc | no | boolean | false | parse enum description to generate enum label, format example: `UserRole:User(Normal User)=0,Agent(Agent)=1,Admin(Administrator)=2` |
| hook | no | [Custom Hook](#Custom-Hook) | - | custom hook |

## Custom Hook

| props | type | remark |
| --- | --- | --- |
| afterOpenApiDataInited | (openAPIData: OpenAPIObject) => OpenAPIObject | custom OpenAPI data |
| customFunctionName | (data: APIDataType) => string | custom request client function name |
| customTypeName | (data: APIDataType) => string | custom type name |
| customClassName | (tagName: string) => string | custom tag name |
| customType | ({<br>schemaObject: SchemaObject \| ReferenceObject,<br>namespace: string,<br>originGetType:(schemaObject: SchemaObject \| ReferenceObject, namespace: string, schemas?: ComponentsObject['schemas']) => string,<br>schemas?: ComponentsObject['schemas'],<br>}) => string | custom type <br> _returning a non-string will use the default method to get the type_ |
| customFileNames | (<br>operationObject: OperationObject,<br>apiPath: string,<br>apiMethod: string,<br>) => string[] | custom generate request client controller file name, can return multiple: generate multiple files. <br> _if the return value is empty, the default getFileNames is used_ |
| customTemplates | {<br>[TypescriptFileType.serviceController]?: <T, U>(item: T, context: U) => string;<br>} | custom template, details see source code |
| customRenderTemplateData | {<br>[TypescriptFileType]?: (list: any[], context: {fileName: string, params: Record<string, unknown>}) => any[]<br>} | custom list parameter processing during file generation, provides fine-grained control for different file types |

## Apifox-Config

| attribute | type | description | required |
| --- | --- | --- | --- |
| projectId | string | project id | true |
| apifoxToken | string | [get](https://docs.apifox.com/doc-5723694) | true |
| local | string | language(default:zh-CN) | false |
| apifoxVersion | string | default: 2024-03-28, [current apifox version](https://api.apifox.com/v1/versions) | false |
| selectedTags | \* or string[] | default: \* | false |
| excludedByTags | string[] | default: [] | false |
| oasVersion | string | specify the version of the OpenAPI specification used for export, can have values such as "2.0", "3.0" or "3.1" | '3.0' |
| exportFormat | string | specify the format of the exported OpenAPI file, can have values such as 'JSON' or 'YAML' | 'JSON' |
| includeApifoxExtensionProperties | boolean | specify whether to include the OpenAPI specification extension fields `x-apifox` | false |
| addFoldersToTags | boolean | specify whether to include the directory name of the interface in the tag field | false |

## JSON Schemas

- default generate JSON Schemas based on [components.schemas](https://spec.openapis.org/oas/latest.html#components-object), JSON Schemas corresponding to [paths](https://spec.openapis.org/oas/latest.html#paths-object) currently need to be parsed by yourself
- provide a schema parsing function to fill the references of `$ref` and `$allOf` into `current schema`

```ts
export declare function patchSchema<T extends object>(
  schema: ISchemaObject,
  schemas: ComponentsObject['schemas']
): T;
```

## Mock

currently using [mockjs](http://mockjs.com) to generate mock data, the mocks file startup needs to rely on [@umijs/server](https://umijs.org/docs/guides/mock), we will look for other solutions later to achieve a better mock experience

## Adapt to uniapp

it is recommended to use a custom request function to adapt to uniapp. you can also use the `@uni-helper/axios-adapter` adapter. for details, see [【use docs 2.2】](https://github.com/openapi-ui/openapi-ts-request/issues/100)

## Notes on Upgrading Older Versions

- Current naming convention changes
- Incremental changes have been made to the current version and will not affect previous versions.
- The `openapi-ts` command can be deprecated to use `openapi`

### The configuration follows the naming convention of the old version as follows

```typescript
import type { APIDataType } from 'openapi-ts-request/dist/generator/type';
import {
  genDefaultFunctionName,
  resolveFunctionName,
  stripDot,
} from 'openapi-ts-request/dist/generator/util';

export default {
  hook: {
    customFunctionName(data: APIDataType, prefix: string) {
      if (data.operationId)
        return resolveFunctionName(stripDot(data.operationId), data.method);
      return data.method + genDefaultFunctionName(data.path, prefix);
    },
  },
};
```

## Contribute

### Development Environment

- node 18+
- pnpm 9+

### Submit Pull Request

1. learn [Pull Request]("https://help.github.com/articles/using-pull-requests") specification
2. fork this repository
3. create a new branch to modify the code：`git checkout -b my-branch main`
4. make sure your code passes all test cases (new functional test cases need to be added for new features)：`pnpm test:unit`
5. create a changeset file using the command：`pnpm changeset`
6. submit your changes using commit (must follow commitlint specification)
7. submit Pull Request

## Thanks

- [openapi2typescript](https://github.com/chenshuai2144/openapi2typescript)
