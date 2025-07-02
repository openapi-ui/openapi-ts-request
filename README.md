<!-- TODO:需要修改文档, 添加参数, 添加apifox的配置支持 -->

## 介绍

[![GitHub Repo stars](https://img.shields.io/github/stars/openapi-ui/openapi-ts-request?style=social)](https://github.com/openapi-ui/openapi-ts-request) [![npm (scoped)](https://img.shields.io/npm/v/openapi-ts-request)](https://www.npmjs.com/package/openapi-ts-request) ![GitHub tag](https://img.shields.io/github/v/tag/openapi-ui/openapi-ts-request?include_prereleases)

<a href="https://github.com/openapi-ui/openapi-ts-request/blob/master/README-en_US.md">English</a> | 简体中文

根据 [Swagger2/OpenAPI3/Apifox](https://swagger.io/blog/news/whats-new-in-openapi-3-0/) 文档生成:

- TypeScript/JavaScript
- 客户端请求函数(支持任意客户端)
- 模拟请求响应服务
- 枚举和枚举翻译
- react-query/vue-query
- 类型字段翻译
- JSON Schemas
- Apifox Config

文档：[使用手册](https://github.com/openapi-ui/openapi-ts-request/issues/100)

## 功能

- 支持 Swagger2.0/OpenAPI/Apifox 3.0,3.1 定义
- 生成 TypeScript/JavaScript, 请求客户端(支持任意客户端), 请求模拟服务, 枚举和枚举翻译, react-query/vue-query, 类型字段翻译, JSON Schemas
- 支持通过 npx、CLI、Nodejs 的方式使用
- 支持自定义请求工具函数, 支持 Fetch、Axios、[UniApp-Request](https://github.com/openapi-ui/openapi-ts-request/issues/46)、Taro-Request、Node.js、XHR 客户端
- 支持通过 tags 过滤生成结果
- 支持 JSON/YAML 定义文件
- 支持将中文 tag 名称翻译为英文 tag 名称
- 支持直接配置`apifox`的`token`和`projectId`直接生成

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
  // schemaPath: './openapi.json', // 本地openapi文件
  // serversPath: './src/apis', // 接口存放路径
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

运行：

```bash
npm run openapi
```

生成的接口：

```bash
src/apis/index.ts #接口入口文件
src/apis/types.ts #类型定义文件
src/apis/pet.ts #接口文件
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

// ... 其他接口
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

运行：

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

运行：

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

运行：

```bash
openapi --i ./spec.json --o ./apis
```

## 参数

| 属性 | 必填 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| schemaPath | 是 | string | - | Swagger2/OpenAPI3 地址 |
| serversPath | 否 | string | './src/apis' | 运行结果文件夹路径 |
| requestLibPath | 否 | string | 'axios' | 自定义请求方法路径，例如：'@/request'、'node-fetch' |
| full | 否 | boolean | true | 是否全量替换 |
| enableLogging | 否 | boolean | false | 是否开启日志 |
| priorityRule | 否 | string | 'include' | 模式规则，可选include/exclude/both |
| includeTags | 否 | (string\|RegExp)[] | - | 根据指定的 tags 生成代码, priorityRule=include则必填 |
| includePaths | 否 | (string\|RegExp)[] | - | 根据指定的 paths 生成代码 |
| excludeTags | 否 | (string\|RegExp)[] | - | 根据指定的 tags 不生成代码 |
| excludePaths | 否 | (string\|RegExp)[] | - | 根据指定的 paths 不生成代码 |
| requestOptionsType | 否 | string | '{ [key: string]: unknown }' | 自定义请求方法 options 参数类型 |
| requestImportStatement | 否 | string | - | 自定义请求方法表达式，例如："const request = require('@/request')" |
| apiPrefix | 否 | string | - | api path的前缀，例如：'api'(动态变量), "'api'"(字符串) |
| isGenReactQuery | 否 | boolean | false | 是否生成 react-query |
| reactQueryMode | 否 | string | 'react' | react-query 模式，可选 react/vue |
| isGenJavaScript | 否 | boolean | false | 是否生成 JavaScript |
| isDisplayTypeLabel | 否 | boolean | false | 是否生成 type 对应的label |
| isGenJsonSchemas | 否 | boolean | false | 是否生成 JSON Schemas |
| mockFolder | 否 | string | - | mock文件路径，例如：'./mocks' |
| authorization | 否 | string | - | 文档权限凭证 |
| apifoxConfig | 否 | [Apifox Config](#Apifox-Config) | - | apifox 配置 |
| nullable | 否 | boolean | false | 使用 null 代替可选 |
| isTranslateToEnglishTag | 否 | boolean | false | 将中文 tag 名称翻译成英文 tag 名称 |
| isOnlyGenTypeScriptType | 否 | boolean | false | 仅生成 typescript 类型 |
| isCamelCase | 否 | boolean | true | 小驼峰命名文件和请求函数 |
| isSupportParseEnumDesc | 否 | boolean | false | 解析枚举描述生成枚举标签，格式参考：`系统用户角色:User(普通用户)=0,Agent(经纪人)=1,Admin(管理员)=2` |
| hook | 否 | [Custom Hook](#Custom-Hook) | - | 自定义 hook |

## 自定义 Hook

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| afterOpenApiDataInited | (openAPIData: OpenAPIObject) => OpenAPIObject | 自定义 OpenAPI 数据 |
| customFunctionName | (data: APIDataType) => string | 自定义请求方法函数名称 |
| customTypeName | (data: APIDataType) => string | 自定义类型名称 |
| customClassName | (tagName: string) => string | 自定义标签名 |
| customType | ({<br>schemaObject: SchemaObject \| ReferenceObject,<br>namespace: string,<br>originGetType:(schemaObject: SchemaObject \| ReferenceObject, namespace: string, schemas?: ComponentsObject['schemas']) => string,<br>schemas?: ComponentsObject['schemas'],<br>}) => string | 自定义类型 <br> _返回非字符串将使用默认方法获取type_ |
| customFileNames | (<br>operationObject: OperationObject,<br>apiPath: string,<br>apiMethod: string,<br>) => string[] | 自定义生成的请求客户端文件名称，可以返回多个文件名称的数组(表示生成多个文件). <br> _返回为空，则使用默认的方法获取_ |
| customTemplates | {<br>[TypescriptFileType.serviceController]?: <T, U>(item: T, context: U) => string;<br>} | 自定义模板，详情请看源码 |

## Apifox-Config

| 属性 | 类型 | 说明 | 必填 |
| --- | --- | --- | --- |
| projectId | string | 项目id | true |
| apifoxToken | string | [获取](https://docs.apifox.com/doc-5723694) | true |
| local | string | 语言(默认: zh-CN) | false |
| apifoxVersion | string | 默认: 2024-03-28, [获取当前版本](https://api.apifox.com/v1/versions) | false |
| includeTags | \* 或 string[] | 默认: \* | false |
| excludeTags | string[] | 默认: [] | false |
| oasVersion | string | 指定用于导出的 OpenAPI 规范的版本，可以有值如 "2.0"、"3.0"、"3.1" | '3.0' |
| exportFormat | string | 指定导出的 OpenAPI 文件的格式，可以有值如 'JSON' 或 'YAML' | 'JSON' |
| includeApifoxExtensionProperties | boolean | 指定是否包含 Apifox 的 OpenAPI 规范扩展字段 `x-apifox` | false |
| addFoldersToTags | boolean | 指定是否在标签字段中包含接口的目录名称 | false |

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

## 旧版本升级注意事项

- 当前命名规范修改
- 当前版本已完成增量修改, 不会影响以前
- 可以弃用`openapi-ts`命令, 直接使用`openapi`

### 沿用旧版本命名规范配置如下

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

## 贡献

### 环境要求

- node 18+
- pnpm 9+

### 提交 Pull Request

1. 熟悉 [Pull Request]("https://help.github.com/articles/using-pull-requests") 规范
2. fork 此仓库
3. 开一个新分支修改代码：`git checkout -b my-branch main`
4. 确保你的代码可以通过所有测试用例(新增功能需要添加新的功能测试用例)：`pnpm test:unit`
5. 创建 changeset 文件通过命令：`pnpm changeset`
6. 使用 commit 提交你的修改(需遵循 commitlint 规范)
7. 发起 Pull Request

## 感谢

- [openapi2typescript](https://github.com/chenshuai2144/openapi2typescript)
