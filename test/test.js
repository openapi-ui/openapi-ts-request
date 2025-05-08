const assert = require('assert');
const path = require('path');
const fs = require('fs');

const openAPI = require('../dist/index');

const gen = async () => {
  // 测试空的 openapi 定义
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-empty.json`,
    serversPath: './apis/empty',
    isDisplayTypeLabel: true,
    isGenJsonSchemas: true,
  });

  // 测试 tags 为 undefined
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-tags-undefined.json`,
    serversPath: './apis/tags-undefined',
  });

  // 测试 tags 为[]
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-tags-empty.json`,
    serversPath: './apis/tags-empty',
  });

  // 测试 swagger => openapi, schema 循环引用
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger-get-method-params-convert-obj.json`,
    serversPath: './apis/convert-obj',
  });

  // 测试空的 schema 引用
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-schema-contain-blank-symbol.json`,
    serversPath: './apis/blank-symbol',
  });

  // 自定义 hook
  await openAPI.generateService({
    requestLibPath: "import request from '@/request';",
    schemaPath: `${__dirname}/example-files/openapi-custom-hook.json`,
    serversPath: './apis/custom',
    hook: {
      // 自定义类名
      customClassName: (tagName) => {
        return /[A-Z].+/.exec(tagName);
      },
      // 自定义函数名
      customFunctionName: (data) => {
        let funName = data.operationId ? data.operationId : '';
        const suffix = 'Using';

        if (funName.indexOf(suffix) != -1) {
          funName = funName.substring(0, funName.lastIndexOf(suffix));
        }

        return funName;
      },
      // 自定义类型名
      customTypeName: (data) => {
        const { operationId } = data;
        const funName = operationId
          ? operationId[0].toUpperCase() + operationId.substring(1)
          : '';
        const tag = data?.tags?.[0];

        return `${tag ? tag : ''}${funName}`;
      },
      // 自定义模板
      customTemplates: {
        serviceController: (api, ctx) => {
          if (api.method.toUpperCase() === 'GET') {
            return `
export async function ${api.functionName}(${api.params && api.hasParams ? `params: ${ctx.namespace}.${api.typeName}` : ''}) {
  return request.get('${api.path}', { params })
}`
          }
          else {
            return `
export async function ${api.functionName}(${api.body ? `data: ${api.body.type}` : ''}) {
  return request.post('${api.path}', data)
}`
          }
        }
      }
    },
  });

  // 支持 null 类型作为默认值
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi.json`,
    serversPath: './apis/support-null',
    nullable: true,
    mockFolder: './mocks',
  });

  // 正常命名文件和请求函数
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-camelcase.json`,
    serversPath: './apis/name/normal',
    isCamelCase: false,
  });

  // 小驼峰命名文件和请求函数
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-camelcase.json`,
    serversPath: './apis/name/camelcase',
    isCamelCase: true,
  });

  // 测试处理 allof 结构, 生成复杂 type 翻译
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-test-allof-api.json`,
    serversPath: './apis/allof',
    isDisplayTypeLabel: true,
  });

  // 文件上传
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger-file-convert.json`,
    serversPath: './apis/file',
    isGenReactQuery: true,
  });

  // 生成枚举翻译, 生成 type 翻译
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
    serversPath: './apis/display-enum-label',
    isDisplayTypeLabel: true,
  });

  // 测试筛选出指定 tags 对应的api
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi.json`,
    serversPath: './apis/filter-tags',
    includeTags: ['pet'],
  });

  // 测试生成 JSON Schemas
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
    serversPath: './apis/schemas',
    isGenJsonSchemas: true,
  });

  // 测试设置 path 前缀
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger.json`,
    serversPath: './apis/api-prefix',
    apiPrefix: '"/pet"',
  });

  // 测试解析 swagger.yaml/openapi.yaml
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger.yaml`,
    serversPath: './apis/yaml',
  });

  // 测试将中文 tag 名称翻译成英文 tag 名称
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-chinese-tag.json`,
    serversPath: './apis/chinese-tag',
    isTranslateToEnglishTag: true,
  });

  // 测试支持 components 非 schemas 的字段
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger-components-response.json`,
    serversPath: './apis/components-response',
  });

  // 测试 $ref 引用中包含 encode 编码字符
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-ref-encode-character.json`,
    serversPath: './apis/ref-encode-character',
    includeTags: ['商品基础管理'],
  });

  // 测试支持 apifox x-run-in-apifox
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-ref-encode-character.json`,
    serversPath: './apis/x-run-in-apifox',
  });

  // 测试 schemas 包含枚举数组
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-schemas-enum-array.json`,
    serversPath: './apis/schemas-enum-array',
  });

  // 测试 只生成 typescript 类型，不生成请求函数
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi.json`,
    serversPath: './apis/only-generate-typescript-type',
    isOnlyGenTypeScriptType: true,
    isDisplayTypeLabel: true,
    isGenJsonSchemas: true,
  });

  // 测试 number类型 枚举
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-number-enum.json`,
    serversPath: './apis/number-enum',
  });

  // 测试 number类型 枚举，使用 desc 解析枚举
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-desc-enum.json`,
    serversPath: './apis/openapi-desc-enum',
    isSupportParseEnumDesc: true,
  });

  // 测试支持 apifox x-apifox-enum
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-apifox-enum-label.json`,
    serversPath: './apis/apifox-enum-label',
  });

  // 测试生成 react-query
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
    serversPath: './apis/react-query',
    isGenReactQuery: true,
  });

  // 测试生成 react-query 的 vue 模式
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
    serversPath: './apis/react-query-vue',
    isGenReactQuery: true,
    reactQueryMode: 'vue',
  });

  // 测试生成 JavaScript
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
    serversPath: './apis/javascript',
    isGenReactQuery: true,
    isGenJavaScript: true,
  });

  // 测试生成 response type comments
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-response-desc.json`,
    serversPath: './apis/openapi-response-desc',
  });

  // check 文件生成
  const fileControllerStr = fs.readFileSync(
    path.join(__dirname, 'apis/file/fileController.ts'),
    'utf8'
  );
  assert(fileControllerStr.indexOf('!(item instanceof File)') > 0);
  assert(fileControllerStr.indexOf(`'multipart/form-data'`) > 0);
  assert(fileControllerStr.indexOf('Content-Type') > 0);
};

gen();
