import { isEmpty, map } from 'lodash';

import { PriorityRule, ReactQueryMode } from './config';
import type { TypescriptFileType } from './generator/config';
import { mockGenerator } from './generator/mockGenarator';
import ServiceGenerator from './generator/serviceGenarator';
import type { APIDataType } from './generator/type';
import type {
  ComponentsObject,
  IPriorityRule,
  IReactQueryMode,
  OpenAPIObject,
  OperationObject,
  ReferenceObject,
  SchemaObject,
} from './type';
import { type GetSchemaByApifoxProps } from './type';
import {
  getImportStatement,
  getOpenAPIConfig,
  getOpenAPIConfigByApifox,
  translateChineseModuleNodeToEnglish,
} from './util';

export * from './generator/patchSchema';

export type GenerateServiceProps = {
  /**
   * Swagger2/OpenAPI3 地址
   */
  schemaPath: string;
  /**
   * 生成的文件夹的路径
   */
  serversPath?: string;
  /**
   * 自定义请求方法路径
   * 默认: import request from 'axios';
   * 方式一: '@/request'
   * 方式二: import request from '@/request';
   */
  requestLibPath?: string;
  /**
   * 是否全量替换, 默认: true, 如果为false, 则进行增量替换
   */
  full?: boolean;
  /**
   * 开启日志
   */
  enableLogging?: boolean;
  /**
  /**
   * 优先规则, include(只允许include列表) | exclude(只排除exclude列表) | both(允许include列表，排除exclude列表)
   */
  priorityRule?: IPriorityRule;
  /**
   * 只解析归属于 tags 集合的 api 和 schema
   */
  includeTags?: (string | RegExp)[];
  /**
   * 只解析归属于 paths 集合的 api
   */
  includePaths?: (string | RegExp)[];
  /**
   * 不解析归属于 tags 集合的 api 和 schema
   */
  excludeTags?: (string | RegExp)[];
  /**
   * 不解析归属于 paths 集合的 api
   */
  excludePaths?: (string | RegExp)[];
  /**
   * 自定义请求方法 options 参数类型
   */
  requestOptionsType?: string;
  /**
   * 自定义请求方法表达式
   * 例如: const request = require('node-fetch');
   */
  requestImportStatement?: string;
  /**
   * api 的前缀
   */
  apiPrefix?:
    | string
    | ((params: {
        path: string;
        method: string;
        namespace: string;
        functionName: string;
      }) => string);
  /**
   * 是否生成 react-query 配置
   */
  isGenReactQuery?: boolean;
  /**
   * reactQuery 模式
   */
  reactQueryMode?: IReactQueryMode;
  /**
   * 是否生成 JavaScript, 不生成 TypeScript
   */
  isGenJavaScript?: boolean;
  /**
   * 是否生成 type 对应的label, 默认: false
   */
  isDisplayTypeLabel?: boolean;
  /**
   * 是否生成 JSON Schemas, 默认: false
   */
  isGenJsonSchemas?: boolean;
  /**
   * response中数据字段
   * for example: ['result']
   */
  dataFields?: string[];
  /**
   * mock目录
   */
  mockFolder?: string;
  /**
   * 文档权限凭证
   */
  authorization?: string;
  /**
   * apifox 配置
   */
  apifoxConfig?: GetSchemaByApifoxProps;
  /**
   * 默认为false，true时使用null代替可选值
   */
  nullable?: boolean;
  /**
   * 是否将中文 tag 名称翻译成英文 tag 名称
   */
  isTranslateToEnglishTag?: boolean;
  /**
   * 仅仅生成类型，不生成请求函数
   */
  isOnlyGenTypeScriptType?: boolean;
  /**
   * 模板文件、请求函数采用小驼峰命名
   */
  isCamelCase?: boolean;
  /**
   * 是否使用 description 中的枚举定义
   */
  isSupportParseEnumDesc?: boolean;
  /**
   * 命名空间名称，默认为API，不需要关注
   */
  namespace?: string;
  /**
   * 模板文件的文件路径，不需要关注
   */
  templatesFolder?: string;
  /**
   * 请求超时时间
   */
  timeout?: number;
  /**
   * 多网关唯一标识
   */
  uniqueKey?: string;
  /**
   * 自定义 hook
   */
  hook?: {
    /** change open api data after constructor */
    afterOpenApiDataInited?: (openAPIData: OpenAPIObject) => OpenAPIObject;
    /** 自定义函数名称 */
    customFunctionName?: (data: APIDataType, prefix?: string) => string;
    /** 自定义类型名称 */
    customTypeName?: (data: APIDataType) => string;
    /** 自定义 options 默认值 */
    customOptionsDefaultValue?: (
      data: OperationObject
    ) => Record<string, any> | undefined;
    /** 自定义 tag 名称 */
    customClassName?: (tagName: string) => string;
    /**
     * 自定义获取type hook
     * 返回非字符串将使用默认方法获取type
     * @example set number to string
     * function customType({ schemaObject, namespace }){
     *  if(schemaObject.type==='number' && !schemaObject.format){
     *    return 'BigDecimalString';
     *  }
     * }
     */
    customType?: ({
      schemaObject,
      namespace,
      originGetType,
      schemas,
    }: {
      schemaObject: SchemaObject | ReferenceObject;
      namespace: string;
      originGetType: (
        schemaObject: SchemaObject,
        namespace: string,
        schemas?: ComponentsObject['schemas']
      ) => string;
      schemas?: ComponentsObject['schemas'];
    }) => string;
    /**
     * 自定义生成文件名，可返回多个，表示生成多个文件;
     * 返回为空，则使用默认的获取方法获取;
     * @example  使用operationId生成文件名
     * function customFileNames(operationObject, apiPath){
     *   const operationId = operationObject.operationId;
     *   if (!operationId) {
     *      console.warn('[Warning] no operationId', apiPath);
     *      return null;
     *    }
     *    const res = operationId.split('_');
     *    if (res.length > 1) {
     *      res.shift();
     *      if (res.length > 2) {
     *        console.warn('[Warning]  operationId has more than 2 part', apiPath);
     *      }
     *      return [res.join('_')];
     *    } else {
     *      const controllerName = (res || [])[0];
     *      if (controllerName) {
     *        return [controllerName];
     *      }
     *      return null;
     *    }
     * }
     */
    customFileNames?: (
      operationObject: OperationObject,
      apiPath: string,
      apiMethod: string
    ) => string[] | null;
    /**
     * 自定义模板
     */
    customTemplates?: {
      /**
       * 自定义 displayTypeLabel 模板
       */
      [TypescriptFileType.displayTypeLabel]?: <T, U>(
        types: T[],
        config: U
      ) => string;
      /**
       * 自定义 displayEnumLabel 模板
       */
      [TypescriptFileType.displayEnumLabel]?: <T, U>(
        enums: T[],
        config: U
      ) => string;

      /**
       * 自定义 serviceController 模板
       */
      [TypescriptFileType.serviceController]?: <T, U>(
        item: T,
        context: U
      ) => string;
    };
  };
};

export async function generateService({
  requestLibPath,
  schemaPath,
  mockFolder,
  includeTags,
  excludeTags,
  includePaths,
  excludePaths,
  authorization,
  isTranslateToEnglishTag,
  priorityRule = PriorityRule.include,
  timeout = 60_000,
  reactQueryMode = ReactQueryMode.react,
  apifoxConfig,
  ...rest
}: GenerateServiceProps) {
  if (!schemaPath && !apifoxConfig) {
    return;
  }

  let openAPI: OpenAPIObject | null = null;
  if (apifoxConfig) {
    openAPI = (await getOpenAPIConfigByApifox(apifoxConfig)) as OpenAPIObject;
  }

  if (schemaPath) {
    openAPI = (await getOpenAPIConfig(
      schemaPath,
      authorization,
      timeout
    )) as OpenAPIObject;
  }

  if (!openAPI || isEmpty(openAPI)) {
    return;
  }

  if (isTranslateToEnglishTag) {
    await translateChineseModuleNodeToEnglish(openAPI);
  }

  const requestImportStatement = getImportStatement(requestLibPath);
  const serviceGenerator = new ServiceGenerator(
    {
      schemaPath,
      serversPath: './src/apis',
      requestImportStatement,
      enableLogging: false,
      priorityRule,
      includeTags: includeTags
        ? map(includeTags, (item) =>
            typeof item === 'string' ? item.toLowerCase() : item
          )
        : priorityRule === PriorityRule.include ||
            priorityRule === PriorityRule.both
          ? [/.*/g]
          : null,
      includePaths: includePaths
        ? map(includePaths, (item) =>
            typeof item === 'string' ? item.toLowerCase() : item
          )
        : priorityRule === PriorityRule.include ||
            priorityRule === PriorityRule.both
          ? [/.*/g]
          : null,
      excludeTags: excludeTags
        ? map(excludeTags, (item) =>
            typeof item === 'string' ? item.toLowerCase() : item
          )
        : null,
      excludePaths: excludePaths
        ? map(excludePaths, (item) =>
            typeof item === 'string' ? item.toLowerCase() : item
          )
        : null,
      requestOptionsType: '{[key: string]: unknown}',
      namespace: 'API',
      isGenReactQuery: false,
      reactQueryMode,
      isGenJavaScript: false,
      isDisplayTypeLabel: false,
      isGenJsonSchemas: false,
      nullable: false,
      isOnlyGenTypeScriptType: false,
      isCamelCase: true,
      isSupportParseEnumDesc: false,
      full: true,
      ...rest,
    },
    openAPI
  );
  serviceGenerator.genFile();

  if (mockFolder) {
    mockGenerator({
      openAPI,
      mockFolder: mockFolder,
    });
  }
}
