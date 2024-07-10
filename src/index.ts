import { isEmpty, map } from 'lodash';

import { mockGenerator } from './generator/mockGenarator';
import ServiceGenerator from './generator/serviceGenarator';
import { APIDataType } from './generator/type';
import {
  ComponentsObject,
  OpenAPIObject,
  OperationObject,
  ReferenceObject,
  SchemaObject,
} from './type';
import { getImportStatement, getOpenAPIConfig } from './util';

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
   * 只解析归属于 tags 集合的api 和 schema
   */
  allowedTags?: string[];
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
   * 默认为false，true时使用null代替可选值
   */
  nullable?: boolean;
  /**
   * 模板文件、请求函数采用小驼峰命名
   */
  isCamelCase?: boolean;
  /**
   * 命名空间名称，默认为API，不需要关注
   */
  namespace?: string;
  /**
   * 模板文件的文件路径，不需要关注
   */
  templatesFolder?: string;
  /**
   * 自定义 hook
   */
  hook?: {
    /** change open api data after constructor */
    afterOpenApiDataInited?: (openAPIData: OpenAPIObject) => OpenAPIObject;
    /** 自定义函数名称 */
    customFunctionName?: (data: APIDataType) => string;
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
     * function customType(schemaObject,namespace){
     *  if(schemaObject.type==='number' && !schemaObject.format){
     *    return 'BigDecimalString';
     *  }
     * }
     */
    customType?: ({
      schemaObject,
      namespace,
      schemas,
      originGetType,
    }: {
      schemaObject: SchemaObject | ReferenceObject;
      namespace: string;
      schemas?: ComponentsObject['schemas'];
      originGetType: (schemaObject: SchemaObject, namespace: string) => string;
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
  };
};

export async function generateService({
  requestLibPath,
  schemaPath,
  mockFolder,
  allowedTags,
  ...rest
}: GenerateServiceProps) {
  if (!schemaPath) {
    return;
  }

  const openAPI = (await getOpenAPIConfig(schemaPath)) as OpenAPIObject;

  if (isEmpty(openAPI)) {
    return;
  }

  const requestImportStatement = getImportStatement(requestLibPath);
  const serviceGenerator = new ServiceGenerator(
    {
      schemaPath,
      serversPath: './src/apis',
      requestImportStatement,
      requestOptionsType: '{[key: string]: unknown}',
      namespace: 'API',
      nullable: false,
      isCamelCase: true,
      isDisplayTypeLabel: false,
      isGenJsonSchemas: false,
      allowedTags: allowedTags
        ? map(allowedTags, (item) => item.toLowerCase())
        : null,
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
