import { find, forEach, isObject, keys, map, upperFirst } from 'lodash';
import type { OpenAPIV3 } from 'openapi-types';

import { SchemaObjectType } from '../config';
import type {
  ArraySchemaObject,
  ContentObject,
  ISchemaObject,
  OpenAPIObject,
  ParameterObject,
  ReferenceObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
} from '../type';
import {
  DEFAULT_PATH_PARAM,
  DEFAULT_SCHEMA,
  lineBreakReg,
  numberEnum,
  parametersIn,
} from './config';
import type { ICustomParameterObject, IPropObject, ITypeItem } from './type';
import {
  getBinaryMediaTypes,
  getBinaryResponseType,
  getLastRefName,
  getRefName,
  isAllNumber,
  isAllNumeric,
  isBinaryArraySchemaObject,
  isBinaryMediaType,
  isNonArraySchemaObject,
  isReferenceObject,
  isSchemaObject,
  parseDescriptionEnum,
  parseDescriptionEnumByReg,
  resolveRefs,
} from './util';

/**
 * 解析对象类型参数
 */
export interface ResolveObjectParams {
  schemaObject: ISchemaObject;
  openAPIData: OpenAPIObject;
  config: {
    namespace?: string;
    isSupportParseEnumDesc?: boolean;
    supportParseEnumDescByReg?: string | RegExp;
  };
  getType: (schemaObject: ISchemaObject, namespace?: string) => string;
  resolveRefObject: <T>(refObject: ReferenceObject | T) => T;
}

/**
 * 解析数组类型
 */
export function resolveArray(params: {
  schemaObject: ArraySchemaObject;
  namespace?: string;
  getType: (schemaObject: ISchemaObject, namespace?: string) => string;
}): { type: string } {
  const { schemaObject, namespace, getType } = params;

  if (isReferenceObject(schemaObject.items)) {
    const refName = getRefName(schemaObject.items);

    return {
      type: `${refName}[]`,
    };
  } else if (schemaObject.items?.enum) {
    return {
      type: getType(schemaObject, namespace),
    };
  }

  return { type: 'unknown[]' };
}

/**
 * 解析属性
 */
export function resolveProperties(params: {
  schemaObject: SchemaObject;
  getProps: (schemaObject: SchemaObject) => IPropObject[];
}): { props: IPropObject[][] } {
  const { schemaObject, getProps } = params;

  return {
    props: [getProps(schemaObject)],
  };
}

/**
 * 解析枚举对象
 */
export function resolveEnumObject(params: {
  schemaObject: SchemaObject;
  config: {
    isSupportParseEnumDesc?: boolean;
    supportParseEnumDescByReg?: string | RegExp;
  };
}): {
  isEnum: boolean;
  type: string;
  enumLabelType: string;
  description?: string;
} {
  const { schemaObject, config } = params;
  const enumArray = schemaObject.enum;
  let enumStr = '';
  let enumLabelTypeStr = '';

  // 获取实际的类型（处理 OpenAPI 3.1 的 type 数组情况）
  const getActualType = (type: typeof schemaObject.type): string => {
    if (Array.isArray(type)) {
      // 如果是数组，返回第一个非 null 类型
      return (type.find((t) => t !== 'null') as string | undefined) || 'string';
    }
    return type;
  };

  const actualType = getActualType(schemaObject.type);

  if (numberEnum.includes(actualType) || isAllNumber(enumArray)) {
    if (config.isSupportParseEnumDesc && schemaObject.description) {
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
    if (numberEnum.includes(actualType) || isAllNumber(enumArray)) {
      if (
        (config.isSupportParseEnumDesc || config.supportParseEnumDescByReg) &&
        schemaObject.description
      ) {
        const enumMap = config.isSupportParseEnumDesc
          ? parseDescriptionEnum(schemaObject.description)
          : parseDescriptionEnumByReg(
              schemaObject.description,
              config.supportParseEnumDescByReg
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

  // 格式化描述文本，让描述支持换行
  const formattedDescription =
    schemaObject.description && lineBreakReg.test(schemaObject.description)
      ? '\n * ' + schemaObject.description.split('\n').join('\n * ') + '\n'
      : schemaObject.description;

  return {
    isEnum: true,
    type: Array.isArray(enumArray) ? enumStr : 'string',
    enumLabelType: enumLabelTypeStr,
    description: formattedDescription,
  };
}

/**
 * 解析 allOf 对象
 */
export function resolveAllOfObject(params: {
  schemaObject: SchemaObject;
  getType: (schemaObject: ISchemaObject) => string;
  getProps: (schemaObject: SchemaObject) => IPropObject[];
}): { props: (IPropObject[] | { type: string }[])[] } {
  const { schemaObject, getType, getProps } = params;

  const props = map(schemaObject.allOf, (item) => {
    return isReferenceObject(item)
      ? [{ ...item, type: getType(item) }]
      : getProps(item);
  });

  if (schemaObject.properties) {
    const extProps = getProps(schemaObject);

    return { props: [...props, extProps] };
  }

  return { props };
}

/**
 * 获取 TS 类型的属性列表
 */
export function getProps(params: {
  schemaObject: SchemaObject;
  getType: (schema: SchemaObject) => string;
  openAPIData?: OpenAPIObject;
}): IPropObject[] {
  const { schemaObject, getType, openAPIData } = params;
  const requiredPropKeys = schemaObject?.required ?? false;
  const properties = schemaObject.properties;

  return keys(properties).map((propKey) => {
    const schema = (properties?.[propKey] || DEFAULT_SCHEMA) as SchemaObject;
    // 剔除属性键值中的特殊符号，因为函数入参变量存在特殊符号会导致解析文件失败
    // eslint-disable-next-line no-useless-escape
    propKey = propKey.replace(/[\[|\]]/g, '');

    // 获取描述信息，如果是 $ref 引用，尝试获取引用对象的描述
    let desc = [schema.title, schema.description]
      .filter((item) => item)
      .join(' ');
    // 格式化描述文本，让描述支持换行
    desc = lineBreakReg.test(desc)
      ? '\n * ' + desc.split('\n').join('\n * ') + '\n'
      : desc;

    // 如果是 $ref 引用，尝试获取引用对象的描述
    if (isReferenceObject(schema) && openAPIData) {
      const refName = getLastRefName(schema.$ref);
      const refSchema = openAPIData.components?.schemas?.[
        refName
      ] as SchemaObject;
      if (refSchema) {
        let refDesc = [refSchema.title, refSchema.description]
          .filter((item) => item)
          .join(' ');
        // 格式化描述文本，让描述支持换行
        refDesc = lineBreakReg.test(refDesc)
          ? '\n * ' + refDesc.split('\n').join('\n * ') + '\n'
          : refDesc;
        if (refDesc) {
          desc = desc + refDesc;
        }
      }
    }

    // 复用 schema 部分字段
    return {
      ...schema,
      name: propKey,
      type: getType(schema),
      desc: desc,
      // 如果没有 required 信息，默认全部是非必填
      required: requiredPropKeys
        ? requiredPropKeys.some((key) => key === propKey)
        : false,
    };
  });
}

/**
 * 解析参数引用
 */
export function resolveParameterRef(params: {
  param: ParameterObject | ReferenceObject;
  openAPIData: OpenAPIObject;
}): ParameterObject | null {
  const { param, openAPIData } = params;

  if (!isReferenceObject(param)) {
    return param;
  }

  // 解析 $ref 引用，从 components.parameters 中获取实际定义
  const refName = getLastRefName(param.$ref);
  const parameter =
    (openAPIData.components?.parameters?.[refName] as ParameterObject) || null;

  return parameter;
}

/**
 * 解析引用对象
 */
export function resolveRefObject<T>(params: {
  refObject: ReferenceObject | T;
  openAPIData: OpenAPIObject;
  resolveRefObjectFunc: (params: {
    refObject: ReferenceObject | T;
    openAPIData: OpenAPIObject;
    resolveRefObjectFunc: (params: {
      refObject: ReferenceObject | T;
      openAPIData: OpenAPIObject;
      resolveRefObjectFunc: any;
    }) => T;
  }) => T;
}): T {
  const { refObject, openAPIData, resolveRefObjectFunc } = params;

  if (!isReferenceObject(refObject)) {
    return refObject;
  }

  const refPaths = refObject.$ref.split('/');

  if (refPaths[0] === '#') {
    const schema = resolveRefs(openAPIData, refPaths.slice(1)) as
      | ISchemaObject
      | undefined;

    if (!schema) {
      throw new Error(`[GenSDK] Data Error! Notfoud: ${refObject.$ref}`);
    }

    const resolvedSchema = resolveRefObjectFunc({
      refObject: schema as ReferenceObject | T,
      openAPIData,
      resolveRefObjectFunc,
    });

    let resolvedType: string | undefined;
    if (isReferenceObject(schema)) {
      const refResolved = resolveRefObjectFunc({
        refObject: schema as ReferenceObject | T,
        openAPIData,
        resolveRefObjectFunc,
      });
      resolvedType = (refResolved as { type?: string })?.type;
    } else {
      const schemaObj: SchemaObject = schema;
      // 处理 OpenAPI 3.1 的 type 数组情况
      if (Array.isArray(schemaObj.type)) {
        // 如果是数组，使用第一个非 null 类型
        resolvedType =
          (schemaObj.type.find((t) => t !== 'null') as string | undefined) ||
          'string';
      } else {
        resolvedType = schemaObj.type;
      }
    }

    const finalSchema = schema as SchemaObject;
    return {
      ...(resolvedSchema || {}),
      type: resolvedType || finalSchema.type,
    } as T;
  }

  return refObject as T;
}

/**
 * 生成多状态码响应类型定义
 */
export function getResponsesType(params: {
  responses: ResponsesObject;
  functionName: string;
  interfaceTPConfigs: ITypeItem[];
  components: OpenAPIV3.ComponentsObject;
  getResponseTypeFromContentFunc: (params: {
    response: ResponseObject;
    components: OpenAPIV3.ComponentsObject;
  }) => string;
  resolveRefObjectFunc: <T>(refObject: ReferenceObject | T) => T;
}): string | null {
  const {
    responses,
    functionName,
    interfaceTPConfigs,
    components,
    getResponseTypeFromContentFunc,
    resolveRefObjectFunc,
  } = params;

  if (
    Object.keys(responses || {}).length === 0 ||
    interfaceTPConfigs.find(
      (item) => item.typeName === upperFirst(`${functionName}Responses`)
    )
  ) {
    return null;
  }

  // 生成主响应类型名称
  const mainResponseTypeName = upperFirst(`${functionName}Response`);
  const responseEntries = parseResponseEntries({
    responses,
    components,
    getResponseTypeFromContentFunc,
    resolveRefObjectFunc,
  });

  const responseTypes = responseEntries.map(
    ({ statusCode, type, description = '' }) => {
      // 检查是否已存在对应的主响应类型，如果存在则复用，避免重复定义
      const existType = interfaceTPConfigs.find(
        (item) => item.typeName === mainResponseTypeName
      );
      const lastType = existType ? mainResponseTypeName : type;

      // 格式化描述文本，让描述支持换行
      const formattedDescription = lineBreakReg.test(description)
        ? description.split('\n')?.join('\n * ')
        : description;

      // 生成带注释的类型定义
      return formattedDescription
        ? `  /**\n * ${formattedDescription}\n */\n ${statusCode}: ${lastType};`
        : `  ${statusCode}: ${lastType};`;
    }
  );

  // 返回完整的对象类型定义
  return `{\n${responseTypes.join('\n')}\n}`;
}

/**
 * 解析响应条目
 */
export function parseResponseEntries(params: {
  responses: ResponsesObject;
  components: OpenAPIV3.ComponentsObject;
  getResponseTypeFromContentFunc: (params: {
    response: ResponseObject;
    components: OpenAPIV3.ComponentsObject;
  }) => string;
  resolveRefObjectFunc: <T>(refObject: ReferenceObject | T) => T;
}): Array<{ statusCode: string; type: string; description: string }> {
  const {
    responses,
    components,
    getResponseTypeFromContentFunc,
    resolveRefObjectFunc,
  } = params;

  return keys(responses).map((statusCode) => {
    const response = resolveRefObjectFunc(
      responses[statusCode] as ResponseObject
    );

    if (!response) {
      return { statusCode, type: 'unknown', description: '' };
    }

    const responseType = getResponseTypeFromContentFunc({
      response,
      components,
    });
    const description = response.description || '';

    return { statusCode, type: responseType, description };
  });
}

/**
 * 从响应内容中提取 TypeScript 类型
 */
export function getResponseTypeFromContent(params: {
  response: ResponseObject;
  components: OpenAPIV3.ComponentsObject;
  config: {
    dataFields?: string[];
    binaryMediaTypes?: string[];
  };
  getType: (schema: SchemaObject) => string;
}): string {
  const { response, components, config, getType } = params;

  if (!response.content) {
    return 'unknown';
  }

  const resContent: ContentObject = response.content;
  const resContentMediaTypes = keys(resContent);

  // 检测二进制流媒体类型
  const binaryMediaTypes = getBinaryMediaTypes(config.binaryMediaTypes);
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

  let schema = (resContent[mediaType].schema || DEFAULT_SCHEMA) as SchemaObject;

  if (isReferenceObject(schema)) {
    const refName = getLastRefName(schema.$ref);
    const childrenSchema = components.schemas[refName];

    // 如果配置了 dataFields，尝试从指定字段提取类型
    if (isNonArraySchemaObject(childrenSchema) && config.dataFields) {
      schema = (config.dataFields
        .map((field) => childrenSchema.properties[field])
        .filter(Boolean)?.[0] ||
        resContent[mediaType].schema ||
        DEFAULT_SCHEMA) as SchemaObject;
    }

    return getType(schema);
  } else if (isSchemaObject(schema)) {
    // 设置属性的 required 状态
    keys(schema.properties).map((fieldName) => {
      schema.properties[fieldName]['required'] =
        schema.required?.includes(fieldName) ?? false;
    });
    return getType(schema);
  } else {
    return getType(schema);
  }
}

/**
 * 获取参数模板
 */
export function getParamsTP(params: {
  parameters?: (ParameterObject | ReferenceObject)[];
  path?: string;
  namespace?: string;
  openAPIData: OpenAPIObject;
  getType: (schema: ISchemaObject, namespace?: string) => string;
  resolveParameterRefFunc: (params: {
    param: ParameterObject | ReferenceObject;
    openAPIData: OpenAPIObject;
  }) => ParameterObject | null;
}): Record<string, ParameterObject[]> {
  const {
    parameters = [],
    path = null,
    namespace,
    openAPIData,
    getType,
    resolveParameterRefFunc,
  } = params;

  const templateParams: Record<string, ParameterObject[]> = {};

  if (parameters?.length) {
    forEach(parametersIn, (source) => {
      const paramsList = parameters
        .map((p) => resolveParameterRefFunc({ param: p, openAPIData }))
        .filter((p): p is ParameterObject => p !== null && p.in === source)
        .map((p) => {
          const isDirectObject =
            ((p.schema as SchemaObject)?.type === 'object' ||
              (p as unknown as SchemaObject).type) === 'object';
          const refName = getLastRefName(
            (p.schema as ReferenceObject)?.$ref ||
              (p as unknown as ReferenceObject).$ref
          );
          const schemas = openAPIData.components?.schemas || {};
          const deRefObjEntry = Object.entries(schemas).find(
            ([k]) => k === refName
          );
          const deRefSchema = deRefObjEntry?.[1] as SchemaObject | undefined;
          const isRefObject =
            deRefSchema !== undefined &&
            deRefSchema?.type === 'object' &&
            Object.keys(deRefSchema?.properties || {}).length > 0;

          return {
            ...p,
            isObject: isDirectObject || isRefObject,
            type: getType(p.schema || DEFAULT_SCHEMA, namespace),
          } as ICustomParameterObject;
        });

      if (paramsList.length) {
        templateParams[source] = paramsList;
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

/**
 * 分析类型定义中使用的类型名称
 */
export function analyzeTypeReferences(types: ITypeItem[]): Set<string> {
  const references = new Set<string>();

  types.forEach((typeItem) => {
    // 分析 type 字段
    if (typeof typeItem.type === 'string') {
      // 匹配类型引用，例如: Category, Tag[], _CInputDto, Category | null
      // 支持以下划线开头的类型名
      const typeMatches = typeItem.type.match(/\b_*[A-Z][a-zA-Z0-9_]*\b/g);
      if (typeMatches) {
        typeMatches.forEach((match) => references.add(match));
      }
    }

    // 分析 props
    if (typeItem.props && typeItem.props.length > 0) {
      typeItem.props.forEach((propGroup) => {
        propGroup.forEach((prop) => {
          if (prop.type) {
            // 匹配类型引用，支持以下划线开头的类型名
            const propTypeMatches = prop.type.match(
              /\b_*[A-Z][a-zA-Z0-9_]*\b/g
            );
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
 */
export function getModuleImports(params: {
  moduleTypes: ITypeItem[];
  commonTypes: ITypeItem[];
  enumTypes: ITypeItem[];
}): { commonImports: string[]; enumImports: string[] } {
  const { moduleTypes, commonTypes, enumTypes } = params;

  const references = analyzeTypeReferences(moduleTypes);

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
 * 将公共类型依赖的类型从模块类型移到公共类型
 * 同时检测跨模块引用，将被多个模块使用的类型移到公共类型
 * @param moduleTypes 模块类型
 * @param commonTypes 公共类型
 */
export function moveCommonTypeDependenciesToCommon(params: {
  moduleTypes: Map<string, ITypeItem[]>;
  commonTypes: ITypeItem[];
}): void {
  const { moduleTypes, commonTypes } = params;
  let moved = true;

  while (moved) {
    moved = false;

    // 1. 处理公共类型的依赖
    const commonTypeRefs = analyzeTypeReferences(commonTypes);

    moduleTypes.forEach((types) => {
      const toMove: ITypeItem[] = [];

      types.forEach((typeItem) => {
        if (commonTypeRefs.has(typeItem.typeName)) {
          toMove.push(typeItem);
          moved = true;
        }
      });

      toMove.forEach((typeItem) => {
        const index = types.indexOf(typeItem);
        if (index > -1) {
          types.splice(index, 1);
          commonTypes.push(typeItem);
        }
      });
    });

    // 2. 检测跨模块引用：如果一个类型被其他模块引用，移到 common
    // 首先建立类型名称到定义模块的映射
    const typeDefModule = new Map<string, string>(); // typeName -> moduleName (where it's defined)
    moduleTypes.forEach((types, moduleName) => {
      types.forEach((typeItem) => {
        typeDefModule.set(typeItem.typeName, moduleName);
      });
    });

    // 收集每个模块引用了哪些定义在其他模块的类型
    const crossModuleRefs = new Map<string, Set<string>>(); // typeName -> Set<moduleName that references it>

    moduleTypes.forEach((types, moduleName) => {
      const referencedTypes = analyzeTypeReferences(types);

      referencedTypes.forEach((typeName) => {
        const defModule = typeDefModule.get(typeName);
        // 如果这个类型定义在其他模块，记录跨模块引用
        if (defModule && defModule !== moduleName) {
          if (!crossModuleRefs.has(typeName)) {
            crossModuleRefs.set(typeName, new Set());
          }
          crossModuleRefs.get(typeName).add(moduleName);
        }
      });
    });

    // 找出被其他模块引用的类型（包括被一个或多个其他模块引用）
    const typesToMove = new Set<string>();
    crossModuleRefs.forEach((referencingModules, typeName) => {
      if (referencingModules.size > 0) {
        typesToMove.add(typeName);
      }
    });

    // 将这些类型移到 common
    if (typesToMove.size > 0) {
      moduleTypes.forEach((types) => {
        const toMove: ITypeItem[] = [];

        types.forEach((typeItem) => {
          if (typesToMove.has(typeItem.typeName)) {
            toMove.push(typeItem);
            moved = true;
          }
        });

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

/**
 * 解析文件模板
 */
export function resolveFileTP(params: {
  obj: SchemaObject;
  resolveObjectFunc: (schemaObject: SchemaObject) => any;
}): Array<{ title: string; multiple: boolean }> {
  const { obj, resolveObjectFunc } = params;
  let ret = [] as Array<{ title: string; multiple: boolean }>;
  const resolved = resolveObjectFunc(obj) as ITypeItem;

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
    ret = [
      ...ret,
      ...resolveFileTP({
        obj: resolved.type as SchemaObject,
        resolveObjectFunc,
      }),
    ];
  }

  return ret;
}
