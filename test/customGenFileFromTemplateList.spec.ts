import { join } from 'path';
import { describe, expect, it, vi } from 'vitest';

import { TypescriptFileType } from '../src/generator/config';
import * as openAPI from '../src/index';
import { getSnapshotDir, readGeneratedFiles } from './testUtils';

vi.setConfig({
  testTimeout: 15_000,
});

describe('customRenderTemplateData hook 测试', () => {
  it('测试 ServiceController hook - 过滤和修改 API 列表', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-service-controller-hook',
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.serviceController]: (list, context) => {
            // 过滤掉路径包含 deprecated 的 API
            const filteredList = list.filter(
              (api) => !api.path.includes('deprecated')
            );

            // 为剩余的 API 添加自定义属性并修改描述
            return filteredList.map((api) => ({
              ...api,
              description: `[Hook处理] ${api.description || ''}`,
              customProperty: 'added by hook',
            }));
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-service-controller-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 Interface hook - 修改类型名称和属性', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-interface-hook',
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.interface]: (list, context) => {
            return list.map((item) => ({
              ...item,
              // 为所有类型添加 Custom 前缀
              typeName: `Custom${item.typeName}`,
              // 如果有描述，添加前缀
              description: item.description
                ? `[Hook处理] ${item.description}`
                : item.description,
            }));
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-interface-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 Interface hook - 修改JSONObject', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-interface-json-object-hook',
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.interface]: (list, context) => {
            return list.map((item) => {
              if (item.typeName === 'JSONObject') {
                return {
                  typeName: 'JSONObject',
                  type: 'Record<string, any>',
                  props: [],
                  isEnum: false,
                };
              }
              return item;
            });
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-interface-json-object-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 DisplayEnumLabel hook - 过滤枚举类型', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-enum-label-hook',
      isDisplayTypeLabel: true,
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.displayEnumLabel]: (list, context) => {
            // 只保留包含 Status 的枚举类型
            return list.filter(
              (item) =>
                item.isEnum && item.typeName.toLowerCase().includes('status')
            );
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-enum-label-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 DisplayTypeLabel hook - 修改类型标签', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-type-label-hook',
      isDisplayTypeLabel: true,
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.displayTypeLabel]: (list, context) => {
            // 只保留非枚举类型，并添加前缀
            return list
              .filter((item) => !item.isEnum)
              .map((item) => ({
                ...item,
                typeName: `Label${item.typeName}`,
              }));
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-type-label-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 Schema hook - 修改 JSON Schema 类型名', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-schema-hook',
      isGenJsonSchemas: true,
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.schema]: (list, context) => {
            return list.map((item) => ({
              ...item,
              // 为 schema 类型名添加自定义前缀
              typeName: item.typeName.replace('$', '$custom'),
            }));
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-schema-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 ServiceIndex hook - 排序控制器列表', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-service-index-hook',
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.serviceIndex]: (list, context) => {
            // 按文件名倒序排列
            return [...list].sort((a, b) =>
              b.fileName.localeCompare(a.fileName)
            );
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-service-index-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 ReactQuery hook - 过滤 GET 方法', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-react-query-hook',
      isGenReactQuery: true,
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.reactQuery]: (list, context) => {
            // 只为 GET 方法生成 React Query hooks
            return list.filter((api) => api.method.toLowerCase() === 'get');
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-react-query-hook')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试多个 hook 同时使用', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-multiple-hooks',
      isDisplayTypeLabel: true,
      isGenJsonSchemas: true,
      isGenReactQuery: true,
      hook: {
        // 现有 hook 保持兼容
        customFunctionName: (data) => `hook${data.operationId || 'Api'}`,
        customClassName: (tagName) => `Hook${tagName}Controller`,

        // 新的文件模板 list hook
        customRenderTemplateData: {
          [TypescriptFileType.serviceController]: (list, context) => {
            return list
              .filter((api) => !api.path.includes('deprecated'))
              .slice(0, 2);
          },
          [TypescriptFileType.interface]: (list, context) => {
            return list.map((item) => ({
              ...item,
              typeName: `Multi${item.typeName}`,
            }));
          },
          [TypescriptFileType.reactQuery]: (list, context) => {
            return list.filter((api) => api.method.toLowerCase() === 'get');
          },
        },
      },
    });

    await expect(
      readGeneratedFiles('./apis/test-multiple-hooks')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 hook 异常处理 - hook 函数抛出错误', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-hook-error-handling',
      enableLogging: true,
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.serviceController]: (list, context) => {
            // 故意抛出错误测试错误处理
            throw new Error('测试 hook 错误处理');
          },
          [TypescriptFileType.interface]: (list, context) => {
            // 正常的 hook 应该仍然工作
            return list.map((item) => ({
              ...item,
              typeName: `Error${item.typeName}`,
            }));
          },
        },
      },
    });

    // 即使有 hook 错误，文件生成应该继续正常工作
    await expect(
      readGeneratedFiles('./apis/test-hook-error-handling')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试向后兼容性 - 不使用新 hook 时的默认行为', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-backward-compatibility',
      isDisplayTypeLabel: true,
      isGenJsonSchemas: true,
      // 不设置任何 hook，验证向后兼容性
    });

    await expect(
      readGeneratedFiles('./apis/test-backward-compatibility')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('测试 hook 上下文参数 - 验证 context 对象', async (ctx) => {
    const contextLog: Array<{ fileName: string; hasParams: boolean }> = [];

    await openAPI.generateService({
      schemaPath: join(
        import.meta.dirname,
        './example-files/openapi-custom-gen-file-list-hook.json'
      ),
      serversPath: './apis/test-hook-context',
      hook: {
        customRenderTemplateData: {
          [TypescriptFileType.serviceController]: (list, context) => {
            // 记录 context 信息用于验证
            contextLog.push({
              fileName: context.fileName,
              hasParams: !!context.params,
            });
            return list;
          },
          [TypescriptFileType.interface]: (list, context) => {
            contextLog.push({
              fileName: context.fileName,
              hasParams: !!context.params,
            });
            return list;
          },
        },
      },
    });

    // 验证 context 对象被正确传递
    expect(contextLog.length).toBeGreaterThan(0);
    expect(contextLog.every((log) => log.hasParams)).toBe(true);
    expect(contextLog.some((log) => log.fileName.endsWith('.ts'))).toBe(true);

    await expect(
      readGeneratedFiles('./apis/test-hook-context')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });
});
