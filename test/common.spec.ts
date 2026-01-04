import { join } from 'path';
import { describe, expect, it, vi } from 'vitest';

import * as openAPI from '../src/index';
import { getSnapshotDir, readGeneratedFiles } from './testUtils';

vi.setConfig({
  testTimeout: 10_000,
});

describe('openAPI.generateService', () => {
  it('测试空的 openapi 定义', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-empty.json'
      ),
      serversPath: './apis/empty',
      isDisplayTypeLabel: true,
      isGenJsonSchemas: true,
    });

    await expect(
      readGeneratedFiles('./apis/empty')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 tags 为 undefined', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-tags-undefined.json'
      ),
      serversPath: './apis/tags-undefined',
    });
    await expect(
      readGeneratedFiles('./apis/tags-undefined')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 tags 为[]', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-tags-empty.json'
      ),
      serversPath: './apis/tags-empty',
    });
    await expect(
      readGeneratedFiles('./apis/tags-empty')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 swagger => openapi, schema 循环引用', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/swagger-get-method-params-convert-obj.json'
      ),
      serversPath: './apis/convert-obj',
    });
    await expect(
      readGeneratedFiles('./apis/convert-obj')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试空的 schema 引用', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-schema-contain-blank-symbol.json'
      ),
      serversPath: './apis/blank-symbol',
    });
    await expect(
      readGeneratedFiles('./apis/blank-symbol')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('自定义 hook', async (ctx) => {
    await openAPI.generateService({
      requestLibPath: "import request from '@/request';",
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-hook.json'
      ),
      serversPath: './apis/custom',
      hook: {
        // 自定义类名
        customClassName: (tagName) => {
          return /[A-Z].+/.exec(tagName)?.toString() || '';
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
          serviceController: (api: any, ctx: any) => {
            if (api.method.toUpperCase() === 'GET') {
              return `
export async function ${api.functionName}(${api.params && api.hasParams ? `params: ${ctx.namespace}.${api.typeName}` : ''}) {
  return request.get('${api.path}', { params })
}`;
            } else {
              return `
export async function ${api.functionName}(${api.body ? `data: ${api.body.type}` : ''}) {
  return request.post('${api.path}', data)
}`;
            }
          },
        },
      },
    });
    await expect(
      readGeneratedFiles('./apis/custom')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('支持 null 类型作为默认值', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(import.meta.dirname, './example-files/openapi.json'),
      serversPath: './apis/support-null',
      nullable: true,
      mockFolder: './mocks',
    });
    await expect(
      readGeneratedFiles('./apis/support-null')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('正常命名文件和请求函数', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-camelcase.json'
      ),
      serversPath: './apis/name/normal',
      isCamelCase: false,
    });
    await expect(
      readGeneratedFiles('./apis/name/normal')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('小驼峰命名文件和请求函数', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-camelcase.json'
      ),
      serversPath: './apis/name/camelcase',
      isCamelCase: true,
    });
    await expect(
      readGeneratedFiles('./apis/name/camelcase')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试处理 allof 结构, 生成复杂 type 翻译', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-test-allof-api.json'
      ),
      serversPath: './apis/allof',
      isDisplayTypeLabel: true,
    });
    await expect(
      readGeneratedFiles('./apis/allof')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('文件上传', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/swagger-file-convert.json'
      ),
      serversPath: './apis/file',
      isGenReactQuery: true,
    });
    await expect(
      readGeneratedFiles('./apis/file')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('生成枚举翻译, 生成 type 翻译', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-display-enum-label.json'
      ),
      serversPath: './apis/display-enum-label',
      isDisplayTypeLabel: true,
    });
    await expect(
      readGeneratedFiles('./apis/display-enum-label')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试筛选出指定 tags 对应的api', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(import.meta.dirname, './example-files/openapi.json'),
      serversPath: './apis/filter-tags',
      includeTags: ['pet'],
    });
    await expect(
      readGeneratedFiles('./apis/filter-tags')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 "COMPUTER SCIENCE" 这一类的枚举值在生成的类型中不报错', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-complex-enum-convert.json'
      ),
      serversPath: './apis/complex-enum-convert',
      includePaths: [/.*/g],
      includeTags: [/.*/g],
    });
    await expect(
      readGeneratedFiles('./apis/complex-enum-convert')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试生成 JSON Schemas', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-display-enum-label.json'
      ),
      serversPath: './apis/schemas',
      isGenJsonSchemas: true,
    });
    await expect(
      readGeneratedFiles('./apis/schemas')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试设置 path 前缀', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(import.meta.dirname, './example-files/swagger.json'),
      serversPath: './apis/api-prefix',
      apiPrefix: '"/pet"',
    });
    await expect(
      readGeneratedFiles('./apis/api-prefix')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试解析 swagger.yaml/openapi.yaml', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(import.meta.dirname, './example-files/swagger.yaml'),
      serversPath: './apis/yaml',
    });
    await expect(
      readGeneratedFiles('./apis/yaml')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it(
    '测试将中文 tag 名称翻译成英文 tag 名称',
    {
      timeout: 40_000,
    },
    async (ctx) => {
      await openAPI.generateService({
        schemaPath: join(
          import.meta.dirname,
          './example-files/openapi-chinese-tag.json'
        ),
        serversPath: './apis/chinese-tag',
        isTranslateToEnglishTag: true,
      });
      await expect(
        readGeneratedFiles('./apis/chinese-tag')
      ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
    }
  );

  it('测试支持 components 非 schemas 的字段', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/swagger-components-response.json'
      ),
      serversPath: './apis/components-response',
    });
    await expect(
      readGeneratedFiles('./apis/components-response')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 $ref 引用中包含 encode 编码字符', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-ref-encode-character.json'
      ),
      serversPath: './apis/ref-encode-character',
      includeTags: ['商品基础管理'],
    });
    await expect(
      readGeneratedFiles('./apis/ref-encode-character')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试支持 apifox x-run-in-apifox', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-ref-encode-character.json'
      ),
      serversPath: './apis/x-run-in-apifox',
    });
    await expect(
      readGeneratedFiles('./apis/x-run-in-apifox')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 schemas 包含枚举数组', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-schemas-enum-array.json'
      ),
      serversPath: './apis/schemas-enum-array',
    });
    await expect(
      readGeneratedFiles('./apis/schemas-enum-array')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试只生成 typescript 类型，不生成请求函数', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(import.meta.dirname, './example-files/openapi.json'),
      serversPath: './apis/only-generate-typescript-type',
      isOnlyGenTypeScriptType: true,
      isDisplayTypeLabel: true,
      isGenJsonSchemas: true,
    });
    await expect(
      readGeneratedFiles('./apis/only-generate-typescript-type')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 number类型 枚举', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-number-enum.json'
      ),
      serversPath: './apis/number-enum',
    });
    await expect(
      readGeneratedFiles('./apis/number-enum')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 number类型 枚举，使用 desc 解析枚举', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-desc-enum.json'
      ),
      serversPath: './apis/openapi-desc-enum',
      isSupportParseEnumDesc: true,
    });
    await expect(
      readGeneratedFiles('./apis/openapi-desc-enum')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试支持 apifox x-apifox-enum', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-apifox-enum-label.json'
      ),
      serversPath: './apis/apifox-enum-label',
    });
    await expect(
      readGeneratedFiles('./apis/apifox-enum-label')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试生成 react-query', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-display-enum-label.json'
      ),
      serversPath: './apis/react-query',
      isGenReactQuery: true,
    });
    await expect(
      readGeneratedFiles('./apis/react-query')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试生成 react-query 的 vue 模式', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-display-enum-label.json'
      ),
      serversPath: './apis/react-query-vue',
      isGenReactQuery: true,
      reactQueryMode: 'vue',
    });
    await expect(
      readGeneratedFiles('./apis/react-query-vue')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试生成 JavaScript', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-display-enum-label.json'
      ),
      serversPath: './apis/javascript',
      isGenReactQuery: true,
      isGenJavaScript: true,
    });
    await expect(
      readGeneratedFiles('./apis/javascript')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试生成 response type comments', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-response-desc.json'
      ),
      serversPath: './apis/openapi-response-desc',
    });
    await expect(
      readGeneratedFiles('./apis/openapi-response-desc')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试生成 isSupportParseEnumDesc 设置为true', async (ctx) => {
    await openAPI.generateService({
      schemaPath: `${import.meta.dirname}/example-files/openapi-response-desc.json`,
      serversPath: './apis/openapi-response-desc-parse-enum',
      isSupportParseEnumDesc: true,
    });

    await expect(
      readGeneratedFiles('./apis/openapi-response-desc-parse-enum')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试生成匿名response => 具名response', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-response-desc.json'
      ),
      serversPath: './apis/openapi-anonymous-response',
    });
    await expect(
      readGeneratedFiles('./apis/openapi-anonymous-response')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试解析 components.parameters 中的 $ref 引用', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-components-parameters.yaml'
      ),
      serversPath: './apis/components-parameters',
    });
    await expect(
      readGeneratedFiles('./apis/components-parameters')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试文件下载 API', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-file-download.json'
      ),
      serversPath: './apis/file-download',
      isGenReactQuery: true,
    });
    await expect(
      readGeneratedFiles('./apis/file-download')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试按模块拆分类型文件', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-display-enum-label.json'
      ),
      serversPath: './apis/split-types-by-module',
      splitTypesByModule: true,
      isGenReactQuery: true,
    });
    await expect(
      readGeneratedFiles('./apis/split-types-by-module')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });
});
