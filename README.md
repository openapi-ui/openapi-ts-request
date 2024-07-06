## Introduce

[![GitHub Repo stars](https://img.shields.io/github/stars/openapi-ui/openapi-ts-request?style=social)](https://github.com/openapi-ui/openapi-ts-request)
[![npm (scoped)](https://img.shields.io/npm/v/openapi-ts-request)](https://www.npmjs.com/package/openapi-ts-request)
![GitHub tag](https://img.shields.io/github/v/tag/openapi-ui/openapi-ts-request?include_prereleases)

根据 [Swagger2/OpenAPI3](https://swagger.io/blog/news/whats-new-in-openapi-3-0/) 文档生成 ts 类型, request client 请求代码, request mock 服务, 枚举, type 字段翻译, JSON Schemas

## Features

* support Swagger2.0/OpenAPI 3.0,3.1 specification
* generate TypeScript interface, reuquest client, request mock service, enum, type field label, JSON Schemas
* support custom request function, Fetch、Axios、Uniapp-Request、Node.js、XHR client available
* support filter specification by tags
* support JSON specification

## Usage

```bash
npm i openapi-ts-request --save-dev

pnpm i openapi-ts-request -D
```

### CosmiConfig

在项目根目录新建 ```openapi-ts-request.config.ts``` 
> 配置文件还支持 ***.openapi-ts-request.ts***, ***openapi-ts-request.config.cjs*** 等格式，参考 [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig?tab=readme-ov-file#cosmiconfig)

```ts
export default {
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
}
```

如果项目有多个生成需求，支持传入数组配置

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

在 ```package.json``` 的 ```script``` 中添加 api: ```"openapi": "openapi-ts-request",```

生成 api

```bash
npm run openapi
```

### JS

任意目录 ```xxx/xxx``` 新建 ```openapi-ts-request.config.js```

```ts
const { generateService } = require('openapi-ts-request')

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
})
```

在 ```package.json``` 的 ```script``` 中添加 script: ```"openapi": "node xxx/xxx/openapi-ts-request.config.js"```

生成 api

```bash
npm run openapi
```

### TS

任意目录 ```xxx/xxx``` 新建 ```openapi-ts-request.config.ts```

```ts
const { generateService } = require('openapi-ts-request')

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
})
```

在 ```package.json``` 的 ```script``` 中添加 api: ```"openapi": "ts-node xxx/xxx/openapi-ts-request.config.ts",```

生成 api
```bash
npm run openapi
```

## Parameter

|  属性   | 必填  | 备注 | 类型 | 默认值 |
|  ----  | ----  |  ----  |  ----  | - |
| schemaPath  | 是 | Swagger 2.0 或 OpenAPI 3.0 的地址 | string | - |
| serversPath  | 否 | 生成的文件夹的路径 | string | './src/apis' |
| requestLibPath  | 否 | 自定义请求方法路径 | string | - |
| allowedTags  | 否 | 生成指定 tags 下面的 api | string[] | - |
| requestOptionsType  | 否 | 自定义请求方法 options 参数类型 | string | '{ [key: string]: unknown }' |
| requestImportStatement  | 否 | 自定义请求方法表达式，例如：'@/request' | string | - |
| apiPrefix  | 否 | api 的前缀，例如：'api'(动态变量), 指定字符串("'api'") | string | - |
| isDisplayTypeLabel | 否 | 是否生成 type 对应的label | boolean | false |
| isGenJsonSchemas | 否 | 是否生成 JSON Schemas | boolean | false |
| dataFields | 否 | 定义 response 中数据字段类型 | string[] | - |
| mockFolder  | 否 | mock目录 | string | './mocks' |
| nullable | 否 | 使用null代替可选 | boolean | false |
| isCamelCase | 否 | 小驼峰命名文件和请求函数 | boolean | true |
| hook | 否 | 自定义 hook | [Custom Hook](#Custom-Hook) | - |

## Custom Hook

| 属性           | 类型 | 说明               |
| -------------- | ---- | ------------------ |
| afterOpenApiDataInited | (openAPIData: OpenAPIObject) => OpenAPIObject  | 自定义OpenAPI数据 |
| customFunctionName | (data: APIDataType) => string   | 自定义请求方法函数名称 |
| customTypeName | (data: APIDataType) => string | 自定义类型名称 |
| customClassName | (tagName: string) => string  | 自定义类名 |
| customType | (<br>schemaObject: SchemaObject \| ReferenceObject,<br>namespace: string,<br>originGetType:(schemaObject: SchemaObject \| ReferenceObject, namespace: string) => string,<br>) => string  | 自定义获取类型 <br> *返回非字符串将使用默认方法获取type* |
| customFileNames |  (<br>operationObject: OperationObject,<br>apiPath: string,<br>apiMethod: string,<br>) => string[]   | 自定义生成文件名，可返回多个，表示生成多个文件. <br> *返回为空，则使用默认的获取方法获取* |

## JSON Schemas

- 默认生成 [components.schemas](https://spec.openapis.org/oas/latest.html#components-object) 下面的 JSON Schemas, [paths](https://spec.openapis.org/oas/latest.html#paths-object) 对应的 JSON Schemas 目前需自行解析
- 提供一个解析 schema 的函数用于将 `$ref`, `$allOf` 的引用填充到 `当前schema`

```ts
export declare function patchSchema<T extends object>(schema: ISchemaObject, schemas: ComponentsObject["schemas"]): T;
```

## Mock

目前使用 [mockjs](http://mockjs.com) 生成 mock 数据，mocks 文件启动需要借助 [@umijs/server](https://umijs.org/docs/guides/mock)，后面会寻找其他方案以达到更好的 mock 体验

## Thanks

- [openapi2typescript](https://github.com/chenshuai2144/openapi2typescript)

ps：由于 openapi2typescript 仓库作者不怎么维护这个工具，不会主动增加功能，有些激进的pr也不再合并，为了更大的自主性，也为了方便自己更好的维护此工具，所以基于此仓库重构代码并添加了很多功能，感谢原作者！