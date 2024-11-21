## 介绍

[![GitHub Repo stars](https://img.shields.io/github/stars/openapi-ui/openapi-ts-request?style=social)](https://github.com/openapi-ui/openapi-ts-request) [![npm (scoped)](https://img.shields.io/npm/v/openapi-ts-request)](https://www.npmjs.com/package/openapi-ts-request) ![GitHub tag](https://img.shields.io/github/v/tag/openapi-ui/openapi-ts-request?include_prereleases)

<a href="https://github.com/openapi-ui/openapi-ts-request/blob/master/README-en_US.md">English</a> | 简体中文

根据 [Swagger2/OpenAPI3](https://swagger.io/blog/news/whats-new-in-openapi-3-0/) 文档生成 TS 类型, 客户端请求函数, 模拟请求响应服务, 枚举, 类型字段翻译, JSON Schemas

文档：[使用手册](https://github.com/openapi-ui/openapi-ts-request/issues/100)

## 功能

- 支持 Swagger2.0/OpenAPI 3.0,3.1 定义
- 生成 TS 类型, 请求客户端, 请求模拟服务, 枚举, 类型字段翻译, JSON Schemas
- 支持通过 npx、CLI、Nodejs 的方式使用
- 支持自定义请求工具函数, 支持 Fetch、Axios、[UniApp-Request](https://github.com/openapi-ui/openapi-ts-request/issues/46)、Node.js、XHR 客户端
- 支持通过 tags 过滤生成结果
- 支持 JSON/YAML 定义文件
- 支持将中文 tag 名称翻译为英文 tag 名称

## 使用

```bash
# npm
npm i openapi-ts-request --save-dev

# pnpm
pnpm i openapi-ts-request -D
```

### CosmiConfig

在项目根目录新建 `openapi-ts-request.config.ts`

> 配置文件还支持 **_.openapi-ts-request.ts_**, **_openapi-ts-request.config.cjs_** 等格式，参考 [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig?tab=readme-ov-file#cosmiconfig)

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default {
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
} as GenerateServiceProps;
```

支持传入数组配置进行生成

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

在 `package.json` 的 `script` 中添加命令: `"openapi": "openapi-ts",`

生成结果：

```bash
npm run openapi
```

### JS

任意目录 `xxx/xxx` 新建 `openapi-ts-request.config.js`

```ts
const { generateService } = require('openapi-ts-request');

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
});
```

在 `package.json` 的 `script` 中添加命令: `"openapi": "node xxx/xxx/openapi-ts-request.config.js"`

生成结果：

```bash
npm run openapi
```

### TS

任意目录 `xxx/xxx` 新建 `openapi-ts-request.config.ts`

```ts
const { generateService } = require('openapi-ts-request');

generateService({
  schemaPath: 'http://petstore.swagger.io/v2/swagger.json',
  serversPath: './apis',
});
```

在 `package.json` 的 `script` 中添加命令: `"openapi": "ts-node xxx/xxx/openapi-ts-request.config.ts",`

生成结果：

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
    -V, --version                      output the version number
    -i, --input <string>               OpenAPI specification, can be a path, url (required)
    -o, --output <string>              output directory (required)
    --requestLibPath <string>          custom request lib path, for example: "@/request", "node-fetch", default is "axios"
    --allowedTags <string[]>           generate code from allowed tags
    --requestOptionsType <string>      custom request method options parameter type (default: "{ [key:
                                      string]: unknown }")
    --requestImportStatement <string>  custom request import statement, for example: "const request =
                                      require('@/request')"
    --apiPrefix <string>               custom the prefix of the api path, for example: "api"(variable),
                                      "'api'"(string)
    --isDisplayTypeLabel <boolean>     generate label matching type field (default: false)
    --isGenJsonSchemas <boolean>       generate JSON Schemas (default: false)
    --mockFolder <string>              mock file path
    --authorization <string>           docs authorization
    --nullable <boolean>               null instead of optional (default: false)
    --isTranslateToEnglishTag <boolean>translate chinese tag name to english tag name (default: false)
    --isOnlyGenTypeScriptType <boolean>only generate typescript type (default: false)
    --isCamelCase <boolean>            camelCase naming of controller files and request client (default: true)
    -h, --help                         display help for command
```

生成结果：

```bash
openapi --i ./spec.json --o ./apis
```

## 参数

| 属性 | 必填 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| schemaPath | 是 | string | - | Swagger2/OpenAPI3 地址 |
| serversPath | 否 | string | './src/apis' | 生成结果的文件夹路径 |
| requestLibPath | 否 | string | 'axios' | 自定义请求方法路径，例如：'@/request'、'node-fetch' |
| enableLogging | 否 | boolean | false | 是否开启日志 |
| priorityRule | 否 | string | 'exclude' | 模式规则，可选allowed/exclude/include |
| allowedTags | 否 | (string\|RegExp)[] | - | 根据指定的 tags 生成代码 |
| allowedPaths | 否 | (string\|RegExp)[] | - | 根据指定的 paths 生成代码 |
| excludeTags | 否 | (string\|RegExp)[] | - | 根据指定的 tags 不生成代码 |
| excludePaths | 否 | (string\|RegExp)[] | - | 根据指定的 paths 不生成代码 |
| requestOptionsType | 否 | string | '{ [key: string]: unknown }' | 自定义请求方法 options 参数类型 |
| requestImportStatement | 否 | string | - | 自定义请求方法表达式，例如："const request = require('@/request')" |
| apiPrefix | 否 | string | - | api path的前缀，例如：'api'(动态变量), "'api'"(字符串) |
| isDisplayTypeLabel | 否 | boolean | false | 是否生成 type 对应的label |
| isGenJsonSchemas | 否 | boolean | false | 是否生成 JSON Schemas |
| mockFolder | 否 | string | './mocks' | mock文件路径 |
| authorization | 否 | string | - | 文档权限凭证 |
| nullable | 否 | boolean | false | 使用 null 代替可选 |
| isTranslateToEnglishTag | 否 | boolean | false | 将中文 tag 名称翻译成英文 tag 名称 |
| isOnlyGenTypeScriptType | 否 | boolean | false | 仅生成 typescript 类型 |
| isCamelCase | 否 | boolean | true | 小驼峰命名文件和请求函数 |
| hook | 否 | [Custom Hook](#Custom-Hook) | - | 自定义 hook |

## 自定义 Hook

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| afterOpenApiDataInited | (openAPIData: OpenAPIObject) => OpenAPIObject | 自定义 OpenAPI 数据 |
| customFunctionName | (data: APIDataType) => string | 自定义请求方法函数名称 |
| customTypeName | (data: APIDataType) => string | 自定义类型名称 |
| customClassName | (tagName: string) => string | 自定义标签名 |
| customType | (<br>schemaObject: SchemaObject \| ReferenceObject,<br>namespace: string,<br>originGetType:(schemaObject: SchemaObject \| ReferenceObject, namespace: string) => string,<br>) => string | 自定义类型 <br> _返回非字符串将使用默认方法获取type_ |
| customFileNames | (<br>operationObject: OperationObject,<br>apiPath: string,<br>apiMethod: string,<br>) => string[] | 自定义生成的请求客户端文件名称，可以返回多个文件名称的数组(表示生成多个文件). <br> _返回为空，则使用默认的方法获取_ |

## JSON Schemas

- 默认生成 [components.schemas](https://spec.openapis.org/oas/latest.html#components-object) 下面的 JSON Schemas，[paths](https://spec.openapis.org/oas/latest.html#paths-object) 对应的 JSON Schemas 目前需自行解析
- 提供一个解析 schema 的函数，用于将 `$ref`，`$allOf` 的引用填充到 `当前schema`

```ts
export declare function patchSchema<T extends object>(
  schema: ISchemaObject,
  schemas: ComponentsObject['schemas']
): T;
```

## Mock

目前使用 [mockjs](http://mockjs.com) 生成 mock 数据，mocks 文件启动需要借助 [@umijs/server](https://umijs.org/docs/guides/mock)，后面会寻找其他方案以达到更好的 mock 体验

## 适配uniapp

适配 uniapp 推荐采用自定义 request 函数的方式，你也可以使用 `@uni-helper/axios-adapter` 适配器，详情见 [【使用手册 2.2】](https://github.com/openapi-ui/openapi-ts-request/issues/100)

## 贡献

### 环境要求

- node 18+
- pnpm 9+

### 提交 Pull Request

1. 熟悉 [Pull Request]("https://help.github.com/articles/using-pull-requests") 规范
2. fork 此仓库
3. 开一个新分支修改代码：`git checkout -b my-branch main`
4. 确保你的代码可以通过所有测试用例(新增功能需要添加新的功能测试用例)：`pnpm test`
5. 创建 changeset 文件通过命令：`pnpm changeset`
6. 使用 commit 提交你的修改(需遵循 commitlint 规范)
7. 发起 Pull Request

## 感谢

- [openapi2typescript](https://github.com/chenshuai2144/openapi2typescript)
