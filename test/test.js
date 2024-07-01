const assert = require('assert');
const path = require('path');
const fs = require('fs');

const openAPI = require('../dist/index');

const gen = async () => {
  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-empty.json`,
    serversPath: './apis/empty',
  });

  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger-get-method-params-convert-obj.json`,
    serversPath: './apis/convert-obj',
  });

  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-schema-contain-blank-symbol.json`,
    serversPath: './apis/blank-symbol',
  });

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
        const funName = operationId ? operationId[0].toUpperCase() + operationId.substring(1) : '';
        const tag = data?.tags?.[0];

        return `${tag ? tag : ''}${funName}`;
      },
    },
  });

  // 支持null类型作为默认值
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

  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-test-allof-api.json`,
    serversPath: './apis/allof',
  });

  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/swagger-file-convert.json`,
    serversPath: './apis/file',
  });

  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi-display-enum-label.json`,
    serversPath: './apis/display-enum-label',
  });

  await openAPI.generateService({
    schemaPath: `${__dirname}/example-files/openapi.json`,
    serversPath: './apis/filter-tags',
    allowedTags: ['pet'],
  });

  // check 文件生成
  const fileControllerStr = fs.readFileSync(
    path.join(__dirname, 'apis/file/fileController.ts'),
    'utf8',
  );
  assert(fileControllerStr.indexOf('!(item instanceof File)') > 0);
  assert(fileControllerStr.indexOf(`'multipart/form-data'`) > 0);
  assert(fileControllerStr.indexOf('Content-Type') < 0);
};

gen();
