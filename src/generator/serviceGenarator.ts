import { existsSync, readFileSync } from 'fs';
import { globSync } from 'glob';
import type { Dictionary } from 'lodash';
import {
  entries,
  filter,
  find,
  findIndex,
  forEach,
  isArray,
  isEmpty,
  isFunction,
  isObject,
  keys,
  lowerFirst,
  map,
  upperFirst,
} from 'lodash';
import { minimatch } from 'minimatch';
import nunjucks from 'nunjucks';
import type { OpenAPIV3 } from 'openapi-types';
import { join } from 'path';
import { rimrafSync } from 'rimraf';

import {
  PriorityRule,
  SchemaObjectType,
  displayReactQueryMode,
} from '../config';
import type { GenerateServiceProps } from '../index';
import log from '../log';
import type {
  ArraySchemaObject,
  ContentObject,
  ISchemaObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
} from '../type';
import { camelCase } from '../util';
import {
  DEFAULT_PATH_PARAM,
  DEFAULT_SCHEMA,
  LangType,
  TypescriptFileType,
  commonTypeFileName,
  displayEnumLabelFileName,
  displayReactQueryFileName,
  displayTypeLabelFileName,
  enumFileName,
  interfaceFileName,
  lineBreakReg,
  methods,
  numberEnum,
  parametersIn,
  parametersInsEnum,
  schemaFileName,
  serviceEntryFileName,
} from './config';
import { writeFile } from './file';
import { Merger } from './merge';
import { patchSchema } from './patchSchema';
import type {
  APIDataType,
  ControllerType,
  ICustomParameterObject,
  ICustomSchemaObject,
  IPropObject,
  ISchemaItem,
  IServiceControllerPayload,
  ITypeItem,
  ITypescriptFileType,
  TagAPIDataType,
} from './type';
import { type MergeOption } from './type';
import {
  capitalizeFirstLetter,
  genDefaultFunctionName,
  getAxiosResponseType,
  getBasePrefix,
  getBinaryMediaTypes,
  getBinaryResponseType,
  getDefaultFileTag,
  getDefaultType,
  getFinalFileName,
  getLastRefName,
  getRefName,
  handleDuplicateTypeNames,
  isAllNumber,
  isAllNumeric,
  isArraySchemaObject,
  isBinaryArraySchemaObject,
  isBinaryMediaType,
  isNonArraySchemaObject,
  isReferenceObject,
  isSchemaObject,
  markAllowedSchema,
  parseDescriptionEnum,
  parseDescriptionEnumByReg,
  replaceDot,
  resolveRefs,
  resolveTypeName,
} from './util';

export default class ServiceGenerator {
  protected apiData: TagAPIDataType = {};
  protected classNameList: ControllerType[] = [];
  protected config: GenerateServiceProps;
  protected openAPIData: OpenAPIObject;
  protected schemaList: ISchemaItem[] = [];
  protected interfaceTPConfigs: ITypeItem[] = [];
  // 记录每个类型被哪些模块使用（用于拆分类型文件）
  protected typeModuleMap: Map<string, Set<string>> = new Map();

  constructor(config: GenerateServiceProps, openAPIData: OpenAPIObject) {
    this.config = {
      templatesFolder: join(__dirname, '../../', 'templates'),
      ...config,
    };
    this.generateInfoLog();

    const includeTags = this.config?.includeTags || [];
    const includePaths = this.config?.includePaths || [];
    const excludeTags = this.config?.excludeTags || [];
    const excludePaths = this.config?.excludePaths || [];

    const priorityRule: PriorityRule = PriorityRule[config.priorityRule];

    if (this.config.hook?.afterOpenApiDataInited) {
      this.openAPIData =
        this.config.hook.afterOpenApiDataInited(openAPIData) || openAPIData;
    } else {
      this.openAPIData = openAPIData;
    }

    // 用 tag 分组 paths, { [tag]: [pathMap, pathMap] }
    outerLoop: for (const pathKey in this.openAPIData.paths) {
      // 这里判断paths
      switch (priorityRule) {
        case PriorityRule.include: {
          // includePaths and includeTags is empty, 直接跳过
          if (isEmpty(includeTags) && isEmpty(includePaths)) {
            this.log('priorityRule include need includeTags or includePaths');
            break outerLoop;
          }

          if (
            !isEmpty(includePaths) &&
            !this.validateRegexp(pathKey, includePaths)
          ) {
            continue;
          }
          break;
        }
        case PriorityRule.exclude: {
          if (this.validateRegexp(pathKey, excludePaths)) {
            continue;
          }
          break;
        }
        case PriorityRule.both: {
          // includePaths and includeTags is empty，直接跳过
          if (isEmpty(includeTags) && isEmpty(includePaths)) {
            this.log('priorityRule both need includeTags or includePaths');
            break outerLoop;
          }

          const outIncludePaths =
            !isEmpty(includePaths) &&
            !this.validateRegexp(pathKey, includePaths);
          const inExcludePaths =
            !isEmpty(excludePaths) &&
            this.validateRegexp(pathKey, excludePaths);

          if (outIncludePaths || inExcludePaths) {
            continue;
          }
          break;
        }
        default:
          throw new Error(
            'priorityRule must be "include" or "exclude" or "include"'
          );
      }

      const pathItem = this.openAPIData.paths[pathKey];

      forEach(methods, (method) => {
        const operationObject = pathItem[method] as OperationObject;

        if (!operationObject) {
          return;
        }

        const hookCustomFileNames =
          this.config.hook?.customFileNames || getDefaultFileTag;
        const tags = hookCustomFileNames(operationObject, pathKey, method);

        // 这里判断tags
        tags.forEach((tag) => {
          if (!tag) {
            return;
          }

          if (priorityRule === PriorityRule.include) {
            // includeTags 为空，不会匹配任何path，故跳过
            if (isEmpty(includeTags)) {
              this.log('priorityRule include need includeTags or includePaths');
              return;
            }

            if (!this.validateRegexp(tag, includeTags)) {
              return;
            }
          }

          if (priorityRule === PriorityRule.exclude) {
            if (this.validateRegexp(tag, excludeTags)) {
              return;
            }
          }

          if (priorityRule === PriorityRule.both) {
            // includeTags is empty 没有配置, 直接跳过
            if (isEmpty(includeTags)) {
              this.log('priorityRule both need includeTags or includePaths');
              return;
            }

            const outIncludeTags =
              !isEmpty(includeTags) && !this.validateRegexp(tag, includeTags);
            const inExcludeTags =
              !isEmpty(excludeTags) && this.validateRegexp(tag, excludeTags);

            if (outIncludeTags || inExcludeTags) {
              return;
            }
          }

          const tagTypeName = resolveTypeName(tag);
          const tagKey = this.config.isCamelCase
            ? camelCase(tagTypeName)
            : lowerFirst(tagTypeName);

          if (!this.apiData[tagKey]) {
            this.apiData[tagKey] = [];
          }

          this.apiData[tagKey].push({
            path: pathKey,
            method,
            ...operationObject,
          });
        });
      });
    }
  }

  public genFile() {
    if (this.config.full) {
      try {
        globSync(`${this.config.serversPath}/**/*`)
          .filter((item) => !item.includes('_deperated'))
          .forEach((item) => {
            rimrafSync(item);
          });
      } catch (error) {
        log(`🚥 api 生成失败: ${error}`);
      }
    }
    const isOnlyGenTypeScriptType = this.config.isOnlyGenTypeScriptType;
    const isGenJavaScript = this.config.isGenJavaScript;
    const reactQueryMode = this.config.reactQueryMode;
    const reactQueryFileName = displayReactQueryFileName(reactQueryMode);

    if (!isOnlyGenTypeScriptType) {
      const prettierError = [];

      // 生成 service controller 文件
      this.getServiceTPConfigs().forEach((tp) => {
        const { list, ...restTp } = tp;
        const payload: Omit<typeof tp, 'list'> &
          IServiceControllerPayload<typeof list> = {
          namespace: this.config.namespace,
          requestOptionsType: this.config.requestOptionsType,
          requestImportStatement: this.config.requestImportStatement,
          interfaceFileName: interfaceFileName,
          list,
          ...restTp,
        };
        const hookCustomTemplateService =
          this.config.hook?.customTemplates?.[
            TypescriptFileType.serviceController
          ];

        if (hookCustomTemplateService) {
          payload.list = list.map((item) => {
            return {
              customTemplate: true,
              data: hookCustomTemplateService<typeof item, typeof payload>(
                item,
                payload
              ),
            };
          });
        }

        const hasError = this.genFileFromTemplate(
          isGenJavaScript
            ? getFinalFileName(`${tp.className}.js`)
            : getFinalFileName(`${tp.className}.ts`),
          TypescriptFileType.serviceController,
          payload
        );

        prettierError.push(hasError);

        if (this.config.isGenReactQuery) {
          this.genFileFromTemplate(
            isGenJavaScript
              ? getFinalFileName(`${tp.className}.${reactQueryFileName}.js`)
              : getFinalFileName(`${tp.className}.${reactQueryFileName}.ts`),
            TypescriptFileType.reactQuery,
            {
              namespace: this.config.namespace,
              requestOptionsType: this.config.requestOptionsType,
              requestImportStatement: this.config.requestImportStatement,
              interfaceFileName: interfaceFileName,
              reactQueryModePackageName: displayReactQueryMode(reactQueryMode),
              ...tp,
            }
          );
        }
      });

      if (prettierError.includes(true)) {
        log(
          '🚥 格式化失败，请检查 service controller 文件内可能存在的语法错误'
        );
      }
    }

    // 处理重复的 typeName
    this.interfaceTPConfigs = this.getInterfaceTPConfigs();
    handleDuplicateTypeNames(this.interfaceTPConfigs);

    // 生成 ts 类型声明
    if (!isGenJavaScript) {
      if (this.config.splitTypesByModule) {
        // 按模块拆分类型文件
        const { moduleTypes, commonTypes, enumTypes } =
          this.groupTypesByModule();

        // 生成枚举文件
        if (enumTypes.length > 0) {
          this.genFileFromTemplate(
            `${enumFileName}.ts`,
            TypescriptFileType.enum,
            {
              list: enumTypes,
            }
          );
        }

        // 生成公共类型文件
        if (commonTypes.length > 0) {
          // 分析公共类型需要导入的枚举
          const { enumImports } = this.getModuleImports(
            commonTypes,
            [], // 公共类型不依赖其他公共类型
            enumTypes
          );

          this.genFileFromTemplate(
            `${commonTypeFileName}.ts`,
            TypescriptFileType.moduleType,
            {
              nullable: this.config.nullable,
              list: commonTypes,
              enumImports, // 公共类型需要导入的枚举
            }
          );
        }

        // 生成每个模块的类型文件
        moduleTypes.forEach((types, moduleName) => {
          if (types.length > 0) {
            // 分析该模块需要导入哪些类型
            const { commonImports, enumImports } = this.getModuleImports(
              types,
              commonTypes,
              enumTypes
            );

            this.genFileFromTemplate(
              `${moduleName}.type.ts`,
              TypescriptFileType.moduleType,
              {
                nullable: this.config.nullable,
                list: types,
                commonImports, // 需要导入的公共类型
                enumImports, // 需要导入的枚举类型
              }
            );
          }
        });

        // 生成 types.ts 作为统一导出入口
        this.genFileFromTemplate(
          `${interfaceFileName}.ts`,
          TypescriptFileType.typeIndex,
          {
            hasEnumTypes: enumTypes.length > 0,
            hasCommonTypes: commonTypes.length > 0,
            moduleList: Array.from(moduleTypes.keys()).filter((moduleName) => {
              const types = moduleTypes.get(moduleName);
              return types ? types.length > 0 : false;
            }),
          }
        );
      } else {
        // 传统方式：所有类型在一个文件
        this.genFileFromTemplate(
          `${interfaceFileName}.ts`,
          TypescriptFileType.interface,
          {
            nullable: this.config.nullable,
            list: this.interfaceTPConfigs,
          }
        );
      }
    }

    // 生成枚举翻译
    const enums = filter(this.interfaceTPConfigs, (item) => item.isEnum);
    if (!isGenJavaScript && !isOnlyGenTypeScriptType && !isEmpty(enums)) {
      const hookCustomTemplateService =
        this.config.hook?.customTemplates?.[
          TypescriptFileType.displayEnumLabel
        ];

      this.genFileFromTemplate(
        `${displayEnumLabelFileName}.ts`,
        TypescriptFileType.displayEnumLabel,
        {
          customTemplate: !!hookCustomTemplateService,
          list: hookCustomTemplateService
            ? hookCustomTemplateService(enums, this.config)
            : enums,
          namespace: this.config.namespace,
          interfaceFileName: interfaceFileName,
        }
      );
    }

    const displayTypeLabels = filter(
      this.interfaceTPConfigs,
      (item) => !item.isEnum
    );
    // 生成 type 翻译
    if (
      !isGenJavaScript &&
      !isOnlyGenTypeScriptType &&
      this.config.isDisplayTypeLabel &&
      !isEmpty(displayTypeLabels)
    ) {
      const hookCustomTemplateService =
        this.config.hook?.customTemplates?.[
          TypescriptFileType.displayTypeLabel
        ];

      this.genFileFromTemplate(
        `${displayTypeLabelFileName}.ts`,
        TypescriptFileType.displayTypeLabel,
        {
          customTemplate: !!hookCustomTemplateService,
          list: hookCustomTemplateService
            ? hookCustomTemplateService(enums, this.config)
            : displayTypeLabels,
          namespace: this.config.namespace,
          interfaceFileName: interfaceFileName,
        }
      );
    }

    if (
      !isOnlyGenTypeScriptType &&
      this.config.isGenJsonSchemas &&
      !isEmpty(this.schemaList)
    ) {
      // 处理重复的 schemaName
      handleDuplicateTypeNames(this.schemaList);
      // 生成 schema 文件
      this.genFileFromTemplate(
        isGenJavaScript ? `${schemaFileName}.js` : `${schemaFileName}.ts`,
        TypescriptFileType.schema,
        {
          list: this.schemaList,
        }
      );
    }

    // 生成 service index 文件
    this.genFileFromTemplate(
      isGenJavaScript
        ? `${serviceEntryFileName}.js`
        : `${serviceEntryFileName}.ts`,
      TypescriptFileType.serviceIndex,
      {
        list: this.classNameList,
        namespace: this.config.namespace,
        interfaceFileName: interfaceFileName,
        genType: isGenJavaScript ? LangType.js : LangType.ts,
        isGenJsonSchemas:
          !isOnlyGenTypeScriptType &&
          this.config.isGenJsonSchemas &&
          !isEmpty(this.schemaList),
        schemaFileName: schemaFileName,
        isDisplayEnumLabel: !isOnlyGenTypeScriptType && !isEmpty(enums),
        displayEnumLabelFileName: displayEnumLabelFileName,
        isGenReactQuery: this.config.isGenReactQuery,
        reactQueryFileName,
        isDisplayTypeLabel:
          !isOnlyGenTypeScriptType &&
          this.config.isDisplayTypeLabel &&
          !isEmpty(displayTypeLabels),
        displayTypeLabelFileName: displayTypeLabelFileName,
      }
    );

    // 打印日志
    log('✅ 成功生成 api 文件目录-> ', `  ${this.config.serversPath}`);
  }

  private getInterfaceTPConfigs() {
    const schemas = this.openAPIData.components?.schemas;
    const lastTypes: Array<ITypeItem> = this.interfaceTPConfigs;
    const includeTags = this.config?.includeTags || [];
    const includePaths = this.config?.includePaths || [];
    // 记录每个 schema 被哪些模块使用（用于拆分类型）
    const schemaUsageMap: Map<string, Set<string>> = new Map();

    // 强行替换掉请求参数params的类型，生成方法对应的 xxxxParams 类型
    keys(this.openAPIData.paths).forEach((pathKey) => {
      const pathItem = this.openAPIData.paths[pathKey] as PathItemObject;

      forEach(methods, (method) => {
        const operationObject = pathItem[method] as OperationObject;
        const hookCustomFileNames =
          this.config.hook?.customFileNames || getDefaultFileTag;

        if (!operationObject) {
          return;
        }

        const tags = hookCustomFileNames(operationObject, pathKey, method);

        if (
          isEmpty(includeTags) ||
          (!isEmpty(includeTags) && isEmpty(tags)) ||
          isEmpty(includePaths)
        ) {
          return;
        }

        const flag = this.validateRegexp(
          filter(tags, (tag) => !!tag),
          includeTags
        );

        const pathFlag = this.validateRegexp(pathKey, includePaths);

        if (!flag || !pathFlag) {
          return;
        }

        // 筛选出 pathItem 包含的 $ref 对应的schema
        markAllowedSchema(JSON.stringify(pathItem), this.openAPIData);

        // 如果启用了类型拆分，记录每个 schema 被哪些模块使用
        if (this.config.splitTypesByModule) {
          const pathItemStr = JSON.stringify(pathItem);
          const refRegex = /"\$ref":\s*"#\/components\/schemas\/([^"]+)"/g;
          let match: RegExpExecArray | null;
          while ((match = refRegex.exec(pathItemStr)) !== null) {
            const schemaName = match[1];
            if (!schemaName) continue;
            tags.forEach((tag) => {
              if (tag) {
                const tagTypeName = resolveTypeName(tag);
                const tagKey = this.config.isCamelCase
                  ? camelCase(tagTypeName)
                  : lowerFirst(tagTypeName);
                const className = this.config.hook?.customClassName
                  ? this.config.hook.customClassName(tag)
                  : replaceDot(tagKey);

                if (!schemaUsageMap.has(schemaName)) {
                  schemaUsageMap.set(schemaName, new Set<string>());
                }
                const moduleSet = schemaUsageMap.get(schemaName);
                if (moduleSet) {
                  moduleSet.add(className);
                }
              }
            });
          }
        }

        operationObject.parameters = operationObject.parameters?.filter(
          (item: ParameterObject | ReferenceObject) => {
            const parameter = this.resolveParameterRef(item);
            return parameter?.in !== `${parametersInsEnum.header}`;
          }
        );
        const props = [] as IPropObject[];

        operationObject.parameters?.forEach(
          (param: ParameterObject | ReferenceObject) => {
            const parameter = this.resolveParameterRef(param);
            if (parameter) {
              props.push({
                name: parameter.name,
                desc: (parameter.description ?? '').replace(lineBreakReg, ''),
                required: parameter.required || false,
                type: this.getType(parameter.schema),
              });
            }
          }
        );

        // parameters may be in path
        pathItem.parameters?.forEach(
          (param: ParameterObject | ReferenceObject) => {
            const parameter = this.resolveParameterRef(param);
            if (parameter) {
              props.push({
                name: parameter.name,
                desc: (parameter.description ?? '').replace(lineBreakReg, ''),
                required: parameter.required,
                type: this.getType(parameter.schema),
              });
            }
          }
        );

        const typeName = this.getFunctionParamsTypeName({
          ...operationObject,
          method,
          path: pathKey,
        });

        if (props.length > 0 && typeName) {
          lastTypes.push({
            typeName,
            type: 'Record<string, unknown>',
            props: [props],
            isEnum: false,
          });

          // 记录 Params 类型归属（属于对应的 tag/module）
          if (this.config.splitTypesByModule) {
            tags.forEach((tag) => {
              if (tag) {
                const tagTypeName = resolveTypeName(tag);
                const tagKey = this.config.isCamelCase
                  ? camelCase(tagTypeName)
                  : lowerFirst(tagTypeName);
                const className = this.config.hook?.customClassName
                  ? this.config.hook.customClassName(tag)
                  : replaceDot(tagKey);
                this.markTypeUsedByModule(typeName, className);
              }
            });
          }
        }
      });
    });

    keys(schemas).forEach((schemaKey) => {
      const schema = schemas[schemaKey] as ISchemaObject;

      // 判断哪些 schema 需要添加进 type, schemas 渲染数组
      if (!(schema as ICustomSchemaObject)?.isAllowed) {
        return;
      }

      const result = this.resolveObject(schema) as Dictionary<
        string | boolean | IPropObject[][]
      >;

      const getDefinesType = (): string => {
        if (result?.type) {
          return (schema as SchemaObject).type === 'object'
            ? SchemaObjectType.object
            : numberEnum.includes(result.type as string)
              ? SchemaObjectType.number
              : (result.type as string);
        }

        return 'Record<string, unknown>';
      };

      // 解析 props 属性中的枚举
      if (isArray(result.props) && result.props.length > 0) {
        forEach(result.props[0], (item) => {
          if (item.enum) {
            const enumObj = this.resolveEnumObject(
              item as unknown as SchemaObject
            );
            const enumTypeName = `${upperFirst(item.name)}Enum`;

            lastTypes.push({
              typeName: enumTypeName,
              type: enumObj.type,
              props: [],
              isEnum: enumObj.isEnum,
              displayLabelFuncName: camelCase(`display-${item.name}-Enum`),
              enumLabelType: enumObj.enumLabelType,
              description: enumObj.description,
            });

            // 记录枚举类型归属（继承父 schema 的归属）
            if (
              this.config.splitTypesByModule &&
              schemaUsageMap.has(schemaKey)
            ) {
              const moduleSet = schemaUsageMap.get(schemaKey);
              if (moduleSet) {
                moduleSet.forEach((className) => {
                  this.markTypeUsedByModule(enumTypeName, className);
                });
              }
            }
          }
        });
      }

      const isEnum = result.isEnum as boolean;
      const typeName = resolveTypeName(schemaKey);

      if (typeName) {
        lastTypes.push({
          typeName,
          type: getDefinesType(),
          props: (result.props || []) as IPropObject[][],
          isEnum,
          displayLabelFuncName: isEnum
            ? camelCase(`display-${typeName}-Enum`)
            : '',
          enumLabelType: isEnum ? (result.enumLabelType as string) : '',
          description: result.description as string,
        });

        // 记录 schema 类型归属
        if (this.config.splitTypesByModule && schemaUsageMap.has(schemaKey)) {
          const moduleSet = schemaUsageMap.get(schemaKey);
          if (moduleSet) {
            moduleSet.forEach((className) => {
              this.markTypeUsedByModule(typeName, className);
            });
          }
        }
      }

      if (this.config.isGenJsonSchemas) {
        this.schemaList.push({
          typeName: `$${lowerFirst(resolveTypeName(schemaKey))}`,
          type: JSON.stringify(
            patchSchema<SchemaObject>(
              schema,
              this.openAPIData.components?.schemas
            )
          ),
        });
      }
    });

    return lastTypes?.sort((a, b) => a.typeName.localeCompare(b.typeName)); // typeName排序
  }

  private getServiceTPConfigs() {
    return keys(this.apiData)
      .map((tag, index) => {
        // functionName tag 级别防重
        const tmpFunctionRD: Record<string, number> = {};
        // 获取当前模块的 className (用于记录类型归属)
        const fileName = replaceDot(tag) || `api${index}`;
        const className = this.config.hook?.customClassName
          ? this.config.hook.customClassName(tag)
          : fileName;

        const genParams = this.apiData[tag]
          .filter(
            (api) =>
              // 暂不支持变量, path 需要普通前缀请使用例如: apiPrefix: "`api`", path 需要变量前缀请使用例如: apiPrefix: "api"
              !api.path.includes('${')
          )
          .map((api) => {
            const newApi = api as APIDataType & Dictionary<unknown>;

            try {
              const params =
                this.getParamsTP(newApi.parameters, newApi.path) || {};
              const body = this.getBodyTP(
                newApi.requestBody as RequestBodyObject,
                this.config.namespace
              );
              const bodyWithoutNamespace = this.getBodyTP(
                newApi.requestBody as RequestBodyObject
              );
              const response = this.getResponseTP(newApi.responses);
              const file = this.getFileTP(
                newApi.requestBody as RequestBodyObject
              );
              let formData = false;

              if (body?.mediaType?.includes('form-data') || file) {
                formData = true;
              }

              let functionName = this.getFunctionName(newApi);

              if (functionName && tmpFunctionRD[functionName]) {
                functionName = `${functionName}_${(tmpFunctionRD[functionName] += 1)}`;
              } else if (functionName) {
                tmpFunctionRD[functionName] = 1;
              }

              if (body?.isAnonymous) {
                const bodyName = upperFirst(`${functionName}Body`);
                this.interfaceTPConfigs.push({
                  typeName: bodyName,
                  type: bodyWithoutNamespace?.type,
                  isEnum: false,
                  props: [],
                });
                // 记录类型归属
                if (this.config.splitTypesByModule) {
                  this.markTypeUsedByModule(bodyName, className);
                }
                body.type = `${this.config.namespace}.${bodyName}`;
              }

              if (response?.isAnonymous) {
                const responseName = upperFirst(`${functionName}Response`);
                // 使用正则表达式移除 response?.type 中包含 this.config.namespace 的部分，isAnonymous模式不需要 this.config.namespace 前缀
                const cleanType = response?.type?.includes(
                  `${this.config.namespace}.`
                )
                  ? response?.type?.replace(
                      new RegExp(`${this.config.namespace}\\.`, 'g'),
                      ''
                    )
                  : response?.type || '';
                this.interfaceTPConfigs.push({
                  typeName: responseName,
                  type: cleanType,
                  isEnum: false,
                  props: [],
                });
                // 记录类型归属
                if (this.config.splitTypesByModule) {
                  this.markTypeUsedByModule(responseName, className);
                }

                response.type = `${this.config.namespace}.${responseName}`;
              }

              const responsesType = this.getResponsesType(
                newApi.responses,
                functionName
              );

              // 如果有多个响应类型，生成对应的类型定义
              if (responsesType) {
                const responsesTypeName = upperFirst(
                  `${functionName}Responses`
                );
                this.interfaceTPConfigs.push({
                  typeName: responsesTypeName,
                  type: responsesType,
                  isEnum: false,
                  props: [],
                });
                // 记录类型归属
                if (this.config.splitTypesByModule) {
                  this.markTypeUsedByModule(responsesTypeName, className);
                }
              }

              let formattedPath = newApi.path.replace(
                /:([^/]*)|{([^}]*)}/gi,
                (_, str, str2) => `$\{${str || str2}}`
              );

              // 为 path 中的 params 添加 alias
              const escapedPathParams = map(
                params.path,
                (item, index: number) => ({
                  ...item,
                  alias: `param${index}`,
                })
              );

              if (escapedPathParams.length) {
                escapedPathParams.forEach((param) => {
                  formattedPath = formattedPath.replace(
                    `$\{${param.name}}`,
                    `$\{${param.alias}}`
                  );
                });
              }

              const finalParams =
                escapedPathParams && escapedPathParams.length
                  ? { ...params, path: escapedPathParams }
                  : params;

              // 处理 query 中的复杂对象
              if (finalParams?.query) {
                finalParams.query = finalParams.query.map((item) => ({
                  ...item,
                  isComplexType: (item as ICustomParameterObject).isObject,
                }));
              }

              // 处理 api path 前缀
              const getPrefixPath = () => {
                if (!this.config.apiPrefix) {
                  return formattedPath;
                }

                // 静态 apiPrefix
                const prefix = isFunction(this.config.apiPrefix)
                  ? `${this.config.apiPrefix({
                      path: formattedPath,
                      method: newApi.method,
                      namespace: tag,
                      functionName,
                    })}`.trim()
                  : this.config.apiPrefix.trim();

                if (!prefix) {
                  return formattedPath;
                }

                if (
                  prefix.startsWith("'") ||
                  prefix.startsWith('"') ||
                  prefix.startsWith('`')
                ) {
                  const finalPrefix = prefix.slice(1, prefix.length - 1);
                  const firstPath = formattedPath.split('/')[1];

                  if (
                    firstPath === finalPrefix ||
                    `/${firstPath}` === finalPrefix
                  ) {
                    return formattedPath;
                  }

                  return `${finalPrefix}${formattedPath}`;
                }

                // prefix 变量
                return `$\{${prefix}}${formattedPath}`;
              };

              return {
                ...newApi,
                functionName: this.config.isCamelCase
                  ? camelCase(functionName)
                  : functionName,
                typeName: this.getFunctionParamsTypeName(newApi),
                path: getPrefixPath(),
                pathInComment: formattedPath.replace(/\*/g, '&#42;'),
                apifoxRunLink: newApi?.['x-run-in-apifox'],
                hasPathVariables: formattedPath.includes('{'),
                hasApiPrefix: !!this.config.apiPrefix,
                method: newApi.method,
                // 如果 functionName 和 summary 相同，则不显示 summary
                desc:
                  functionName === newApi.summary
                    ? (newApi.description || '').replace(lineBreakReg, '')
                    : [
                        newApi.summary,
                        newApi.description,
                        (newApi.responses?.default as ResponseObject)
                          ?.description
                          ? `返回值: ${(newApi.responses?.default as ResponseObject).description}`
                          : '',
                      ]
                        .filter((s) => s)
                        .join(' ')
                        .replace(lineBreakReg, ''),
                hasHeader: !!params?.header || !!body?.mediaType,
                params: finalParams,
                hasParams: Boolean(keys(finalParams).length),
                options:
                  this.config.hook?.customOptionsDefaultValue?.(newApi) || {},
                body,
                file,
                hasFormData: formData,
                response,
              };
            } catch (error) {
              console.error('[GenSDK] gen service param error:', error);
              throw error;
            }
          })
          // 排序下，防止git乱
          .sort((a, b) => a.path.localeCompare(b.path));

        // fileName 和 className 已在方法开始时声明
        if (genParams.length) {
          this.classNameList.push({
            fileName: className,
            controllerName: className,
          });
        }

        return {
          genType: this.config.isGenJavaScript ? LangType.js : LangType.ts,
          className,
          instanceName: `${fileName[0]?.toLowerCase()}${fileName.slice(1)}`,
          list: genParams,
        };
      })
      .filter((item) => !!item?.list?.length);
  }

  private genFileFromTemplate(
    fileName: string,
    type: ITypescriptFileType,
    params: Record<string, unknown>
  ): boolean {
    try {
      const template = this.getTemplate(type);

      // 应用 customRenderTemplateData hook (如果存在)
      let processedParams = { ...params };
      const customListHooks = this.config.hook?.customRenderTemplateData;

      if (customListHooks && params.list) {
        try {
          const context = {
            fileName,
            params: processedParams,
          };

          let processedList = params.list;

          // 根据不同的文件类型调用相应的 hook 函数
          switch (type) {
            case TypescriptFileType.serviceController:
              if (customListHooks.serviceController) {
                processedList = customListHooks.serviceController(
                  params.list as APIDataType[],
                  context
                );
              }
              break;
            case TypescriptFileType.reactQuery:
              if (customListHooks.reactQuery) {
                processedList = customListHooks.reactQuery(
                  params.list as APIDataType[],
                  context
                );
              }
              break;
            case TypescriptFileType.interface:
              if (customListHooks.interface) {
                processedList = customListHooks.interface(
                  params.list as ITypeItem[],
                  context
                );
              }
              break;
            case TypescriptFileType.displayEnumLabel:
              if (customListHooks.displayEnumLabel) {
                processedList = customListHooks.displayEnumLabel(
                  params.list as ITypeItem[],
                  context
                );
              }
              break;
            case TypescriptFileType.displayTypeLabel:
              if (customListHooks.displayTypeLabel) {
                processedList = customListHooks.displayTypeLabel(
                  params.list as ITypeItem[],
                  context
                );
              }
              break;
            case TypescriptFileType.schema:
              if (customListHooks.schema) {
                processedList = customListHooks.schema(
                  params.list as ISchemaItem[],
                  context
                );
              }
              break;
            case TypescriptFileType.serviceIndex:
              if (customListHooks.serviceIndex) {
                processedList = customListHooks.serviceIndex(
                  params.list as ControllerType[],
                  context
                );
              }
              break;
          }

          if (processedList !== params.list) {
            processedParams = {
              ...processedParams,
              list: processedList,
            };
            this.log(
              `customRenderTemplateData hook applied for ${type}: ${fileName}`
            );
          }
        } catch (error) {
          console.error(
            `[GenSDK] customRenderTemplateData hook error for ${type}:`,
            error
          );
          this.log(
            `customRenderTemplateData hook failed for ${type}, using original list`
          );
          // 发生错误时使用原始参数继续执行
        }
      }

      // 设置输出不转义
      const env = nunjucks.configure({
        autoescape: false,
      });

      env.addFilter('capitalizeFirst', capitalizeFirstLetter);
      const destPath = join(this.config.serversPath, fileName);
      const destCode = nunjucks.renderString(template, {
        disableTypeCheck: false,
        ...processedParams,
      });
      let mergerProps: MergeOption = {} as MergeOption;

      if (existsSync(destPath)) {
        mergerProps = {
          srcPath: destPath,
        };
      } else {
        mergerProps = {
          source: '',
        };
      }

      if (this.config.full) {
        return writeFile(this.config.serversPath, fileName, destCode);
      }

      const merger = new Merger(mergerProps);

      return writeFile(
        this.config.serversPath,
        fileName,
        merger.merge({
          source: destCode,
        })
      );
    } catch (error) {
      console.error('[GenSDK] file gen fail:', fileName, 'type:', type);
      throw error;
    }
  }

  private getTemplate(type: ITypescriptFileType): string {
    return readFileSync(
      join(this.config.templatesFolder, `${type}.njk`),
      'utf8'
    );
  }

  // 生成方法名 functionName
  private getFunctionName(data: APIDataType) {
    // 获取路径相同部分
    const pathBasePrefix = getBasePrefix(keys(this.openAPIData.paths));

    return this.config.hook && this.config.hook.customFunctionName
      ? this.config.hook.customFunctionName(data, pathBasePrefix)
      : camelCase(
          `${genDefaultFunctionName(data.path, pathBasePrefix)}-using-${data.method}`
        );
    // return this.config.hook && this.config.hook.customFunctionName
    //   ? this.config.hook.customFunctionName(data)
    //   : data.operationId
    //     ? resolveFunctionName(stripDot(data.operationId), data.method)
    //     : data.method + genDefaultFunctionName(data.path, pathBasePrefix);
  }

  private getType(schemaObject: ISchemaObject, namespace?: string) {
    const customTypeHookFunc = this.config.hook?.customType;
    const schemas = this.openAPIData.components?.schemas;

    if (customTypeHookFunc) {
      const type = customTypeHookFunc({
        schemaObject,
        namespace,
        schemas,
        originGetType: getDefaultType,
      });

      if (typeof type === 'string') {
        return type;
      }
    }

    return getDefaultType(schemaObject, namespace, schemas);
  }

  private getFunctionParamsTypeName(data: APIDataType) {
    const namespace = this.config.namespace ? `${this.config.namespace}.` : '';
    const typeName =
      this.config?.hook?.customTypeName?.(data) || this.getFunctionName(data);

    return upperFirst(
      resolveTypeName(`${namespace}${typeName ?? data.operationId}Params`)
    );
  }

  private getBodyTP(requestBody: RequestBodyObject, namespace?: string) {
    const reqBody = this.resolveRefObject(requestBody);

    if (isEmpty(reqBody)) {
      return null;
    }

    const reqContent: ContentObject = reqBody.content;

    if (!isObject(reqContent)) {
      return null;
    }

    let mediaType = keys(reqContent)[0];
    const schema: SchemaObject =
      (reqContent[mediaType]?.schema as SchemaObject) || DEFAULT_SCHEMA;

    if (mediaType === '*/*') {
      mediaType = '';
    }

    // 如果 requestBody 有 required 属性，则正常展示；如果没有，默认非必填
    const required =
      typeof requestBody?.required === 'boolean' ? requestBody.required : false;
    const bodySchema = {
      mediaType,
      required,
      type: this.getType(schema, namespace),
      isAnonymous: false,
    };

    // 匿名 body 场景
    if (!isReferenceObject(schema)) {
      bodySchema.isAnonymous = true;
    }

    return bodySchema;
  }

  private getFileTP(requestBody: RequestBodyObject) {
    const reqBody = this.resolveRefObject(requestBody);

    if (reqBody?.content?.['multipart/form-data']) {
      const ret = this.resolveFileTP(
        reqBody.content['multipart/form-data'].schema as SchemaObject
      );

      return ret.length > 0 ? ret : null;
    }

    return null;
  }

  private resolveFileTP(obj: SchemaObject) {
    let ret = [] as Array<{ title: string; multiple: boolean }>;
    const resolved = this.resolveObject(obj) as ITypeItem;

    const props =
      (resolved.props?.length > 0 &&
        resolved.props[0].filter(
          (p) =>
            p.format === 'binary' ||
            p.format === 'base64' ||
            isBinaryArraySchemaObject(p)
        )) ||
      [];

    if (props.length > 0) {
      ret = props.map((p) => {
        // 这里 p.type 是自定义type, 注意别混淆
        return {
          title: p.name,
          multiple:
            p.type === `${SchemaObjectType.array}` ||
            p.type === `${SchemaObjectType.stringArray}`,
        };
      });
    }

    if (resolved.type) {
      ret = [...ret, ...this.resolveFileTP(resolved.type as SchemaObject)];
    }

    return ret;
  }

  private getResponseTP(responses: ResponsesObject = {}) {
    const { components } = this.openAPIData;
    const response: ResponseObject | undefined =
      responses &&
      this.resolveRefObject(
        responses['200'] || responses['201'] || responses.default
      );
    const defaultResponse = {
      mediaType: '*/*',
      type: 'unknown',
      isAnonymous: false,
      responseType: undefined as string | undefined,
    };

    if (!response) {
      return defaultResponse;
    }

    const resContent: ContentObject | undefined = response.content;
    const resContentMediaTypes = keys(resContent);

    // 检测二进制流媒体类型
    const binaryMediaTypes = getBinaryMediaTypes(this.config.binaryMediaTypes);
    const binaryMediaType = resContentMediaTypes.find((mediaType) =>
      isBinaryMediaType(mediaType, binaryMediaTypes)
    );

    const mediaType = resContentMediaTypes.includes('application/json')
      ? 'application/json'
      : binaryMediaType || resContentMediaTypes[0]; // 优先使用 application/json，然后是二进制类型

    if (!isObject(resContent) || !mediaType) {
      return defaultResponse;
    }

    let schema = (resContent[mediaType].schema ||
      DEFAULT_SCHEMA) as SchemaObject;
    const responseSchema = {
      mediaType,
      type: 'unknown',
      isAnonymous: false,
      responseType: undefined as string | undefined,
    };

    // 如果是二进制媒体类型，直接返回二进制类型
    if (isBinaryMediaType(mediaType, binaryMediaTypes)) {
      const binaryType = getBinaryResponseType();
      responseSchema.type = binaryType;

      // 自动为二进制响应添加 responseType 配置
      responseSchema.responseType = getAxiosResponseType(binaryType);

      return responseSchema;
    }

    if (isReferenceObject(schema)) {
      const refName = getLastRefName(schema.$ref);
      const childrenSchema = components.schemas[refName];

      if (isNonArraySchemaObject(childrenSchema) && this.config.dataFields) {
        schema = (this.config.dataFields
          .map((field) => childrenSchema.properties[field])
          .filter(Boolean)?.[0] ||
          resContent[mediaType].schema ||
          DEFAULT_SCHEMA) as SchemaObject;
      }

      responseSchema.type = this.getType(schema, this.config.namespace);

      return responseSchema;
    }

    if (isSchemaObject(schema)) {
      keys(schema.properties).map((fieldName) => {
        schema.properties[fieldName]['required'] =
          schema.required?.includes(fieldName) ?? false;
      });
      responseSchema.isAnonymous = true;
    }

    responseSchema.type = this.getType(schema, this.config.namespace);

    return responseSchema;
  }

  /**
   * 生成多状态码响应类型定义
   * 将 OpenAPI 的 responses 对象转换为 TypeScript 类型定义
   * 例如：{ 200: ResponseType, 400: unknown, 404: unknown }
   *
   * @param responses OpenAPI 响应对象
   * @param functionName 函数名称，用于生成主响应类型名称
   * @returns 多状态码响应类型定义字符串，如果没有响应则返回 null
   */
  private getResponsesType(
    responses: ResponsesObject = {},
    functionName: string
  ) {
    if (
      isEmpty(responses) ||
      ~findIndex(
        this.interfaceTPConfigs,
        (item) => item.typeName === upperFirst(`${functionName}Responses`)
      )
    ) {
      return null;
    }

    const { components } = this.openAPIData;
    // 生成主响应类型名称
    const mainResponseTypeName = upperFirst(`${functionName}Response`);
    const responseEntries = this.parseResponseEntries(responses, components);

    const responseTypes = responseEntries.map(
      ({ statusCode, type, description = '' }) => {
        // 检查是否已存在对应的主响应类型，如果存在则复用，避免重复定义
        const existType = this.interfaceTPConfigs.find(
          (item) => item.typeName === mainResponseTypeName
        );
        const lastType = existType ? mainResponseTypeName : type;

        // 格式化描述文本，让描述支持换行
        const formattedDescription = lineBreakReg.test(description)
          ? description.split('\n')?.join('\n * ')
          : description;

        // 生成带注释的类型定义
        return formattedDescription
          ? `  /**\n   * ${formattedDescription}\n   */\n  ${statusCode}: ${lastType};`
          : `  ${statusCode}: ${lastType};`;
      }
    );

    // 返回完整的对象类型定义
    return `{\n${responseTypes.join('\n')}\n}`;
  }

  /**
   * 解析响应条目，提取每个状态码对应的类型和描述信息
   *
   * @param responses OpenAPI 响应对象
   * @param components OpenAPI 组件对象，用于解析引用类型
   * @returns 响应条目数组，包含状态码、类型和描述
   */
  private parseResponseEntries(
    responses: ResponsesObject,
    components: OpenAPIV3.ComponentsObject
  ) {
    return keys(responses).map((statusCode) => {
      const response = this.resolveRefObject(
        responses[statusCode] as ResponseObject
      );

      if (!response) {
        return { statusCode, type: 'unknown', description: '' };
      }

      const responseType = this.getResponseTypeFromContent(
        response,
        components
      );
      const description = response.description || '';

      return { statusCode, type: responseType, description };
    });
  }

  /**
   * 从响应内容中提取 TypeScript 类型
   * 处理不同的媒体类型和 schema 类型
   *
   * @param response 响应对象
   * @param components OpenAPI 组件对象
   * @returns TypeScript 类型字符串
   */
  private getResponseTypeFromContent(
    response: ResponseObject,
    components: OpenAPIV3.ComponentsObject
  ): string {
    if (!response.content) {
      return 'unknown';
    }

    const resContent: ContentObject = response.content;
    const resContentMediaTypes = keys(resContent);

    // 检测二进制流媒体类型
    const binaryMediaTypes = getBinaryMediaTypes(this.config.binaryMediaTypes);
    const binaryMediaType = resContentMediaTypes.find((mediaType) =>
      isBinaryMediaType(mediaType, binaryMediaTypes)
    );

    const mediaType = resContentMediaTypes.includes('application/json')
      ? 'application/json'
      : binaryMediaType || resContentMediaTypes[0];

    if (!isObject(resContent) || !mediaType) {
      return 'unknown';
    }

    // 如果是二进制媒体类型，直接返回二进制类型
    if (isBinaryMediaType(mediaType, binaryMediaTypes)) {
      return getBinaryResponseType();
    }

    let schema = (resContent[mediaType].schema ||
      DEFAULT_SCHEMA) as SchemaObject;

    if (isReferenceObject(schema)) {
      const refName = getLastRefName(schema.$ref);
      const childrenSchema = components.schemas[refName];

      // 如果配置了 dataFields，尝试从指定字段提取类型
      if (isNonArraySchemaObject(childrenSchema) && this.config.dataFields) {
        schema = (this.config.dataFields
          .map((field) => childrenSchema.properties[field])
          .filter(Boolean)?.[0] ||
          resContent[mediaType].schema ||
          DEFAULT_SCHEMA) as SchemaObject;
      }

      return this.getType(schema);
    } else if (isSchemaObject(schema)) {
      // 设置属性的 required 状态
      keys(schema.properties).map((fieldName) => {
        schema.properties[fieldName]['required'] =
          schema.required?.includes(fieldName) ?? false;
      });
      return this.getType(schema);
    } else {
      return this.getType(schema);
    }
  }

  private getParamsTP(
    parameters: (ParameterObject | ReferenceObject)[] = [],
    path: string = null
  ): Record<string, ParameterObject[]> {
    const templateParams: Record<string, ParameterObject[]> = {};

    if (parameters?.length) {
      forEach(parametersIn, (source) => {
        const params = parameters
          .map((p) => this.resolveRefObject(p))
          .filter((p) => p.in === source)
          .map((p) => {
            const isDirectObject =
              ((p.schema as SchemaObject)?.type === 'object' ||
                (p as unknown as SchemaObject).type) === 'object';
            const refName = getLastRefName(
              (p.schema as ReferenceObject)?.$ref ||
                (p as unknown as ReferenceObject).$ref
            );
            const deRefObj =
              entries(this.openAPIData.components?.schemas).find(
                ([k]) => k === refName
              ) || [];
            const isRefObject =
              (deRefObj[1] as SchemaObject)?.type === 'object' &&
              !isEmpty((deRefObj[1] as SchemaObject)?.properties);

            return {
              ...p,
              isObject: isDirectObject || isRefObject,
              type: this.getType(
                p.schema || DEFAULT_SCHEMA,
                this.config.namespace
              ),
            } as ICustomParameterObject;
          });

        if (params.length) {
          templateParams[source] = params;
        }
      });
    }

    if (path && path.length > 0) {
      const regex = /\{(\w+)\}/g;
      templateParams.path = templateParams.path || [];
      let match: RegExpExecArray | null = null;

      while ((match = regex.exec(path))) {
        if (!templateParams.path.some((p) => p.name === match[1])) {
          templateParams.path.push({
            ...DEFAULT_PATH_PARAM,
            name: match[1],
          });
        }
      }

      // 如果 path 没有内容，则将删除 path 参数，避免影响后续的 hasParams 判断
      if (!templateParams.path.length) delete templateParams.path;
    }

    return templateParams;
  }

  private resolveObject(schemaObject: ISchemaObject): unknown {
    // 不使用 schemaObject: ISchemaObject = {}
    schemaObject = schemaObject ?? ({} as ISchemaObject);

    // 引用类型
    if (isReferenceObject(schemaObject)) {
      return this.resolveRefObject(schemaObject);
    }

    // 枚举类型
    if (schemaObject.enum) {
      return this.resolveEnumObject(schemaObject);
    }

    // 继承类型
    if (schemaObject.allOf && schemaObject.allOf.length) {
      return this.resolveAllOfObject(schemaObject);
    }

    // 对象类型
    if (schemaObject.properties) {
      return this.resolveProperties(schemaObject);
    }

    // 数组类型
    if (isArraySchemaObject(schemaObject)) {
      return this.resolveArray(schemaObject);
    }

    return schemaObject;
  }

  private resolveArray(schemaObject: ArraySchemaObject) {
    if (isReferenceObject(schemaObject.items)) {
      const refName = getRefName(schemaObject.items);

      return {
        type: `${refName}[]`,
      };
    } else if (schemaObject.items?.enum) {
      return {
        type: this.getType(schemaObject, this.config.namespace),
      };
    }

    // 这里需要解析出具体属性，但由于 parser 层还不确定，所以暂时先返回 unknown[]
    return { type: 'unknown[]' };
  }

  private resolveProperties(schemaObject: SchemaObject) {
    return {
      props: [this.getProps(schemaObject)],
    };
  }

  private resolveEnumObject(schemaObject: SchemaObject) {
    const enumArray = schemaObject.enum;
    let enumStr = '';
    let enumLabelTypeStr = '';

    if (numberEnum.includes(schemaObject.type) || isAllNumber(enumArray)) {
      if (this.config.isSupportParseEnumDesc && schemaObject.description) {
        const enumMap = parseDescriptionEnum(schemaObject.description);
        enumStr = `{${map(enumArray, (value) => {
          const enumLabel = enumMap.get(Number(value));
          return `${enumLabel}=${Number(value)}`;
        }).join(',')}}`;
      } else {
        enumStr = `{${map(enumArray, (value) => `"NUMBER_${value}"=${Number(value)}`).join(',')}}`;
      }
    } else if (isAllNumeric(enumArray)) {
      enumStr = `{${map(enumArray, (value) => `"STRING_NUMBER_${value}"="${value}"`).join(',')}}`;
    } else {
      enumStr = `{${map(enumArray, (value) => `"${value}"="${value}"`).join(',')}}`;
    }

    // 翻译枚举
    if (schemaObject['x-enum-varnames'] && schemaObject['x-enum-comments']) {
      enumLabelTypeStr = `{${map(enumArray, (value, index) => {
        const enumKey = schemaObject['x-enum-varnames'][index];

        return `${value}:"${schemaObject['x-enum-comments'][enumKey]}"`;
      }).join(',')}}`;
    } else if (schemaObject?.['x-apifox']?.['enumDescriptions']) {
      enumLabelTypeStr = `{${map(enumArray, (value: string) => {
        const enumLabel = schemaObject['x-apifox']['enumDescriptions'][value];

        return `${value}:"${enumLabel}"`;
      }).join(',')}}`;
    } else if (schemaObject?.['x-apifox-enum']) {
      enumLabelTypeStr = `{${map(enumArray, (value: string) => {
        const enumLabel = find(
          schemaObject['x-apifox-enum'],
          (item) => item.value === value
        )?.description;

        return `${value}:"${enumLabel}"`;
      }).join(',')}}`;
    } else {
      if (numberEnum.includes(schemaObject.type) || isAllNumber(enumArray)) {
        if (
          (this.config.isSupportParseEnumDesc ||
            this.config.supportParseEnumDescByReg) &&
          schemaObject.description
        ) {
          const enumMap = this.config.isSupportParseEnumDesc
            ? parseDescriptionEnum(schemaObject.description)
            : parseDescriptionEnumByReg(
                schemaObject.description,
                this.config.supportParseEnumDescByReg
              );
          enumLabelTypeStr = `{${map(enumArray, (value) => {
            const enumLabel = enumMap.get(Number(value));
            return `${Number(value)}:"${enumLabel}"`;
          }).join(',')}}`;
        } else {
          enumLabelTypeStr = `{${map(enumArray, (value) => `${Number(value) >= 0 ? Number(value) : `"${value}"`}:"NUMBER_${value}"`).join(',')}}`;
        }
      } else if (isAllNumeric(enumArray)) {
        enumLabelTypeStr = `{${map(enumArray, (value) => `"${value}":"STRING_NUMBER_${value}"`).join(',')}}`;
      } else {
        enumLabelTypeStr = `{${map(enumArray, (value) => `"${value}":"${value}"`).join(',')}}`;
      }
    }

    return {
      isEnum: true,
      type: Array.isArray(enumArray) ? enumStr : 'string',
      enumLabelType: enumLabelTypeStr,
      description: schemaObject.description,
    };
  }

  private resolveAllOfObject(schemaObject: SchemaObject) {
    const props = map(schemaObject.allOf, (item) => {
      return isReferenceObject(item)
        ? [{ ...item, type: this.getType(item) }]
        : this.getProps(item);
    });

    if (schemaObject.properties) {
      const extProps = this.getProps(schemaObject);

      return { props: [...props, extProps] };
    }

    return { props };
  }

  // 获取 TS 类型的属性列表
  private getProps(schemaObject: SchemaObject) {
    const requiredPropKeys = schemaObject?.required ?? false;
    const properties = schemaObject.properties;

    return keys(properties).map((propKey) => {
      const schema = (properties?.[propKey] || DEFAULT_SCHEMA) as SchemaObject;
      // 剔除属性键值中的特殊符号，因为函数入参变量存在特殊符号会导致解析文件失败
      // eslint-disable-next-line no-useless-escape
      propKey = propKey.replace(/[\[|\]]/g, '');

      // 复用 schema 部分字段
      return {
        ...schema,
        name: propKey,
        type: this.getType(schema),
        desc: [schema.title, schema.description]
          .filter((item) => item)
          .join(' ')
          .replace(lineBreakReg, ''),
        // 如果没有 required 信息，默认全部是非必填
        required: requiredPropKeys
          ? requiredPropKeys.some((key) => key === propKey)
          : false,
      };
    });
  }

  private resolveParameterRef(
    param: ParameterObject | ReferenceObject
  ): ParameterObject | null {
    if (!isReferenceObject(param)) {
      return param;
    }

    // 解析 $ref 引用，从 components.parameters 中获取实际定义
    const refName = getLastRefName(param.$ref);
    const parameter = this.openAPIData.components?.parameters?.[
      refName
    ] as ParameterObject;

    return parameter || null;
  }

  private resolveRefObject<T>(refObject: ReferenceObject | T): T {
    if (!isReferenceObject(refObject)) {
      return refObject;
    }

    const refPaths = refObject.$ref.split('/');

    if (refPaths[0] === '#') {
      const schema = resolveRefs(
        this.openAPIData,
        refPaths.slice(1)
      ) as ISchemaObject;

      if (!schema) {
        throw new Error(`[GenSDK] Data Error! Notfoud: ${refObject.$ref}`);
      }

      return {
        ...(this.resolveRefObject(schema) || {}),
        type: isReferenceObject(schema)
          ? this.resolveRefObject<SchemaObject>(schema).type
          : schema.type,
      } as T;
    }

    return refObject as T;
  }

  public log(message: string) {
    if (this.config.enableLogging) {
      log(message);
    }
  }

  private generateInfoLog(): void {
    this.log(`priorityRule: ${this.config?.priorityRule}`);

    if (this.config?.includeTags) {
      this.log(`includeTags: ${this.config?.includeTags.join(', ')}`);
    }

    if (this.config?.excludeTags) {
      this.log(`excludeTags: ${this.config?.excludeTags.join(', ')}`);
    }

    if (this.config?.includePaths) {
      this.log(`includePaths: ${this.config?.includePaths.join(', ')}`);
    }

    if (this.config?.excludePaths) {
      this.log(`excludePaths: ${this.config?.excludePaths.join(', ')}`);
    }
  }

  /**
   * 校验规则
   * @param regexp 正则数组
   * @param data 数据
   */
  private validateRegexp(
    data: string | string[],
    regexp: (string | RegExp)[]
  ): boolean {
    // 确保 data 是数组
    const dataArray = Array.isArray(data) ? data : [data];
    this.log(`"Data Array:", ${dataArray.join(',')}`);
    this.log(`"Regexp Array:", ${regexp.join(',')}`);

    return dataArray.some((item) => {
      const result = regexp.some((reg) => this.matches(item, reg));
      this.log(`"Item:", ${item}, "Matches:", ${result}`);

      return result;
    });
  }

  /**
   *
   * @param item 数组数据
   * @param reg 规则
   */
  // 提取匹配逻辑到单独的函数
  private matches(item: string, reg: string | RegExp): boolean {
    if (typeof reg === 'string') {
      return minimatch(item, reg, {
        nocase: this.config.filterCaseInsensitive,
      });
    } else if (reg instanceof RegExp) {
      reg.lastIndex = 0; // 重置正则表达式的 lastIndex 属性

      return reg.test(item);
    }

    return false; // 对于其他类型，返回 false
  }

  /**
   * 记录类型被某个模块使用
   * @param typeName 类型名称
   * @param moduleName 模块名称
   */
  private markTypeUsedByModule(typeName: string, moduleName: string) {
    if (!this.typeModuleMap.has(typeName)) {
      this.typeModuleMap.set(typeName, new Set());
    }
    const moduleSet = this.typeModuleMap.get(typeName);
    if (moduleSet) {
      moduleSet.add(moduleName);
    }
  }

  /**
   * 分析类型定义中使用的类型名称
   * @param types 类型列表
   * @returns 使用的类型名称集合
   */
  private analyzeTypeReferences(types: ITypeItem[]): Set<string> {
    const references = new Set<string>();

    types.forEach((typeItem) => {
      // 分析 type 字段
      if (typeof typeItem.type === 'string') {
        // 匹配类型引用，例如: Category, Tag[], Category | null
        const typeMatches = typeItem.type.match(/\b[A-Z][a-zA-Z0-9]*\b/g);
        if (typeMatches) {
          typeMatches.forEach((match) => references.add(match));
        }
      }

      // 分析 props
      if (typeItem.props && typeItem.props.length > 0) {
        typeItem.props.forEach((propGroup) => {
          propGroup.forEach((prop) => {
            if (prop.type) {
              // 匹配类型引用
              const propTypeMatches = prop.type.match(/\b[A-Z][a-zA-Z0-9]*\b/g);
              if (propTypeMatches) {
                propTypeMatches.forEach((match) => references.add(match));
              }
            }
          });
        });
      }
    });

    return references;
  }

  /**
   * 获取模块需要导入的类型
   * @param moduleTypes 模块类型列表
   * @param commonTypes 公共类型列表
   * @param enumTypes 枚举类型列表
   * @returns 导入信息
   */
  private getModuleImports(
    moduleTypes: ITypeItem[],
    commonTypes: ITypeItem[],
    enumTypes: ITypeItem[]
  ): { commonImports: string[]; enumImports: string[] } {
    const references = this.analyzeTypeReferences(moduleTypes);

    // 获取公共类型名称集合
    const commonTypeNames = new Set(commonTypes.map((t) => t.typeName));

    // 获取枚举类型名称集合（包括 IEnumName）
    const enumTypeNames = new Set<string>();
    enumTypes.forEach((t) => {
      enumTypeNames.add(t.typeName);
      if (t.isEnum) {
        enumTypeNames.add(`I${t.typeName}`);
      }
    });

    // 筛选出实际需要导入的类型
    const commonImports = Array.from(references).filter((ref) =>
      commonTypeNames.has(ref)
    );

    const enumImports = Array.from(references).filter((ref) =>
      enumTypeNames.has(ref)
    );

    return { commonImports, enumImports };
  }

  /**
   * 分组类型：按模块、公共类型和枚举
   * @returns 分组后的类型
   */
  private groupTypesByModule(): {
    moduleTypes: Map<string, ITypeItem[]>;
    commonTypes: ITypeItem[];
    enumTypes: ITypeItem[];
  } {
    const moduleTypes = new Map<string, ITypeItem[]>();
    const commonTypes: ITypeItem[] = [];
    const enumTypes: ITypeItem[] = [];

    // 初始化每个模块的类型数组
    this.classNameList.forEach((controller) => {
      moduleTypes.set(controller.fileName, []);
    });

    // 遍历所有类型，根据使用情况分组
    this.interfaceTPConfigs.forEach((typeItem) => {
      // 枚举类型单独处理，放入 enumTypes
      if (typeItem.isEnum) {
        enumTypes.push(typeItem);
        return;
      }

      const modules = this.typeModuleMap.get(typeItem.typeName);

      if (!modules || modules.size === 0) {
        // 未被任何模块使用的类型，放入公共类型
        commonTypes.push(typeItem);
      } else if (modules.size === 1) {
        // 只被一个模块使用，放入该模块
        const moduleName = Array.from(modules)[0];
        const moduleTypeList = moduleTypes.get(moduleName);
        if (moduleTypeList) {
          moduleTypeList.push(typeItem);
        } else {
          // 如果模块不存在（可能是因为过滤），放入公共类型
          commonTypes.push(typeItem);
        }
      } else {
        // 被多个模块使用，放入公共类型
        commonTypes.push(typeItem);
      }
    });

    // 处理公共类型的依赖：如果公共类型依赖某个模块类型，将该类型也移到公共类型
    this.moveCommonTypeDependenciesToCommon(moduleTypes, commonTypes);

    return { moduleTypes, commonTypes, enumTypes };
  }

  /**
   * 将公共类型依赖的类型从模块类型移到公共类型
   * @param moduleTypes 模块类型
   * @param commonTypes 公共类型
   * @param enumTypes 枚举类型
   */
  private moveCommonTypeDependenciesToCommon(
    moduleTypes: Map<string, ITypeItem[]>,
    commonTypes: ITypeItem[]
  ): void {
    let moved = true;
    while (moved) {
      moved = false;

      // 获取当前公共类型引用的所有类型名称
      const commonTypeRefs = this.analyzeTypeReferences(commonTypes);

      // 遍历所有模块
      moduleTypes.forEach((types) => {
        const toMove: ITypeItem[] = [];

        types.forEach((typeItem) => {
          // 如果这个类型被公共类型引用，需要移到公共类型
          if (commonTypeRefs.has(typeItem.typeName)) {
            toMove.push(typeItem);
            moved = true;
          }
        });

        // 移动类型
        toMove.forEach((typeItem) => {
          const index = types.indexOf(typeItem);
          if (index > -1) {
            types.splice(index, 1);
            commonTypes.push(typeItem);
          }
        });
      });
    }
  }
}
