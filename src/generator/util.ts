import type { Dictionary } from 'lodash';
import {
  countBy,
  every,
  filter,
  forEach,
  isArray,
  isBoolean,
  isEmpty,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  keys,
  map,
  upperFirst,
} from 'lodash';
import ReservedDict from 'reserved-words';
import pinyin from 'tiny-pinyin';

import { SchemaObjectType } from '../config';
import log from '../log';
import type {
  ArraySchemaObject,
  BinaryArraySchemaObject,
  ComponentsObject,
  ISchemaObject,
  NonArraySchemaObject,
  OpenAPIObject,
  OperationObject,
  ReferenceObject,
  SchemaObject,
} from '../type';
import { numberEnum } from './config';
import type { ICustomSchemaObject, ITypeItem } from './type';

export function stripDot(str: string) {
  return str.replace(/[-_ .](\w)/g, (_all, letter: string) =>
    letter.toUpperCase()
  );
}

// 兼容C#泛型的typeLastName取法
function getTypeLastName(typeName: string): string {
  const tempTypeName = typeName || '';
  const childrenTypeName = tempTypeName?.match(/\[\[.+\]\]/g)?.[0];

  if (!childrenTypeName) {
    const publicKeyToken = (
      tempTypeName.split('PublicKeyToken=')?.[1] ?? ''
    ).replace('null', '');
    const firstTempTypeName = tempTypeName.split(',')?.[0] ?? tempTypeName;
    let typeLastName = firstTempTypeName.split('/').pop().split('.').pop();

    if (typeLastName.endsWith('[]')) {
      typeLastName =
        typeLastName.substring(0, typeLastName.length - 2) + 'Array';
    }

    // 特殊处理C#默认系统类型，不追加publicKeyToken
    const isCsharpSystemType = firstTempTypeName.startsWith('System.');

    if (!publicKeyToken || isCsharpSystemType) {
      return typeLastName;
    }

    return `${typeLastName}_${publicKeyToken}`;
  }

  const currentTypeName = getTypeLastName(
    tempTypeName.replace(childrenTypeName, '')
  );
  const childrenTypeNameLastName = getTypeLastName(
    childrenTypeName.substring(2, childrenTypeName.length - 2)
  );

  return `${currentTypeName}_${childrenTypeNameLastName}`;
}

// 类型声明过滤关键字
export function resolveTypeName(typeName: string) {
  if (ReservedDict.check(typeName)) {
    return `__openAPI__${typeName}`;
  }

  const typeLastName = getTypeLastName(typeName);
  const name = typeLastName
    .replace(/[-_ ](\w)/g, (_all, letter: string) => letter.toUpperCase())
    .replace(/[^\w^\s^\u4e00-\u9fa5]/gi, '');

  // 当model名称是number开头的时候，ts会报错。这种场景一般发生在后端定义的名称是中文
  if (name === '_' || /^\d+$/.test(name)) {
    log(
      '⚠️  models不能以number开头，原因可能是Model定义名称为中文, 建议联系后台修改'
    );
    return `Pinyin_${name}`;
  }

  if (!/[\u3220-\uFA29]/.test(name) && !/^\d$/.test(name)) {
    return upperFirst(name);
  }

  const noBlankName = name.replace(/ +/g, '');

  return upperFirst(pinyin.convertToPinyin(noBlankName, '', true));
}

export function getRefName(refObject: ReferenceObject | string) {
  if (!isReferenceObject(refObject)) {
    return refObject;
  }

  return resolveTypeName(getLastRefName(refObject.$ref));
}

/**
 * 获取引用类型名称，支持类型名称映射
 * @param refObject 引用对象
 * @param schemaKeyToTypeNameMap 从原始 schema key 到最终类型名称的映射（处理重名情况）
 * @returns 最终的类型名称
 */
export function getRefNameWithMapping(
  refObject: ReferenceObject | string,
  schemaKeyToTypeNameMap?: Map<string, string>
) {
  if (!isReferenceObject(refObject)) {
    return refObject;
  }

  const schemaKey = getLastRefName(refObject.$ref);
  // 如果存在映射，使用映射后的类型名称
  if (schemaKeyToTypeNameMap?.has(schemaKey)) {
    return schemaKeyToTypeNameMap.get(schemaKey);
  }

  // 否则使用默认的类型名称解析
  return resolveTypeName(schemaKey);
}

export function getLastRefName(refPath: string = '') {
  const refPaths = refPath.split('/');

  return refPaths.length > 0
    ? decodeURIComponent(refPaths[refPaths.length - 1])
    : '';
}

export function getDefaultType(
  schemaObject?: ISchemaObject | string,
  namespace: string = '',
  schemas?: ComponentsObject['schemas'],
  schemaKeyToTypeNameMap?: Map<string, string>
): string {
  if (isUndefined(schemaObject) || isNull(schemaObject)) {
    return 'unknown';
  }

  if (!isObject(schemaObject)) {
    return schemaObject;
  }

  if (isReferenceObject(schemaObject)) {
    // 使用映射获取正确的类型名称（处理重名情况）
    const refName = getRefNameWithMapping(schemaObject, schemaKeyToTypeNameMap);
    return [namespace, refName].filter((s) => s).join('.');
  }

  let type = schemaObject?.type;
  const dateEnum = ['Date', 'date', 'dateTime', 'date-time', 'datetime'];
  const stringEnum = ['string', 'email', 'password', 'url', 'byte', 'binary'];

  // OpenAPI 3.1 支持 type 为数组，例如 ["string", "null"]
  if (Array.isArray(type)) {
    return type
      .map((t) => {
        // 为数组中的每个类型创建一个临时的 schemaObject
        const tempSchema: ISchemaObject = {
          ...schemaObject,
          type: t,
        };
        return getDefaultType(tempSchema, namespace, schemas);
      })
      .join(' | ');
  }

  if (type === 'null') {
    return 'null';
  }

  if (numberEnum.includes(schemaObject.format)) {
    type = 'number';
  }

  if (schemaObject.enum) {
    type = 'enum';
  }

  if (numberEnum.includes(type)) {
    return 'number';
  }

  if (dateEnum.includes(type)) {
    return 'Date';
  }

  if (stringEnum.includes(type)) {
    return 'string';
  }

  if (type === 'boolean') {
    return 'boolean';
  }

  if (type === 'array') {
    let items = (schemaObject as ArraySchemaObject).items;

    if ('schema' in schemaObject) {
      items = (schemaObject.schema as ArraySchemaObject).items;
    }

    if (Array.isArray(items)) {
      const arrayItemType = items
        .map((subType: Dictionary<unknown>) =>
          getDefaultType(
            (subType.schema || subType) as SchemaObject,
            namespace,
            schemas,
            schemaKeyToTypeNameMap
          )
        )
        .toString();

      return `[${arrayItemType}]`;
    }

    const arrayType = getDefaultType(
      items,
      namespace,
      schemas,
      schemaKeyToTypeNameMap
    );

    return arrayType.includes(' | ') ? `(${arrayType})[]` : `${arrayType}[]`;
  }

  if (type === 'enum') {
    return Array.isArray(schemaObject.enum)
      ? Array.from(
          new Set(
            schemaObject.enum.map((v) =>
              typeof v === 'string'
                ? `"${v.replace(/"/g, '"')}"`
                : getDefaultType(v as string)
            )
          )
        ).join(' | ')
      : 'string';
  }

  if (schemaObject.oneOf && schemaObject.oneOf.length) {
    return schemaObject.oneOf
      .map((item) =>
        getDefaultType(item, namespace, schemas, schemaKeyToTypeNameMap)
      )
      .join(' | ');
  }

  if (schemaObject.anyOf?.length) {
    return schemaObject.anyOf
      .map((item) =>
        getDefaultType(item, namespace, schemas, schemaKeyToTypeNameMap)
      )
      .join(' | ');
  }

  if (schemaObject.allOf?.length) {
    const allofList = schemaObject.allOf.map((item) => {
      if (isReferenceObject(item)) {
        // 不使用 getRefName 函数处理，无法通过 schemas[schemaKey] 获取到schema
        const schemaKey = getLastRefName(item.$ref);

        if ((schemas?.[schemaKey] as SchemaObject)?.enum) {
          return getDefaultType(
            item,
            namespace,
            schemas,
            schemaKeyToTypeNameMap
          );
        }
      }

      return getDefaultType(item, namespace, schemas, schemaKeyToTypeNameMap);
    });

    return `(${allofList.join(' & ')})`;
  }

  if (schemaObject.type === 'object' || schemaObject.properties) {
    if (isObject(schemaObject.additionalProperties)) {
      const type = getDefaultType(
        schemaObject.additionalProperties,
        namespace,
        schemas,
        schemaKeyToTypeNameMap
      );

      return `Record<string, ${type}>`;
    }

    if (!keys(schemaObject.properties).length) {
      return 'Record<string, unknown>';
    }

    return `{ ${keys(schemaObject.properties)
      .map((key) => {
        let required = false;
        const property = (schemaObject.properties?.[key] || {}) as SchemaObject;

        if (isBoolean(schemaObject.required) && schemaObject.required) {
          required = true;
        }

        if (
          isArray(schemaObject.required) &&
          schemaObject.required.includes(key)
        ) {
          required = true;
        }

        if (property.required) {
          required = true;
        }

        /**
         * 将类型属性变为字符串，兼容错误格式如：
         * 3d_tile(数字开头)等错误命名，
         * 在后面进行格式化的时候会将正确的字符串转换为正常形式，
         * 错误的继续保留字符串。
         * */
        return `
        ${property.description ? `/** ${property.description} */\n` : ''}'${key}'${required ? '' : '?'}: ${getDefaultType(
          property,
          namespace,
          schemas,
          schemaKeyToTypeNameMap
        )}; `;
      })
      .join('')}}`;
  }

  return 'unknown';
}

export function getDefaultFileTag(
  operationObject: OperationObject,
  apiPath: string
): string[] {
  let lastTags: string[] = [];

  if (operationObject['x-swagger-router-controller']) {
    lastTags = [operationObject['x-swagger-router-controller'] as string];
  } else if (!isEmpty(operationObject.tags)) {
    lastTags = operationObject.tags;
  } else if (operationObject.operationId) {
    lastTags = [operationObject.operationId];
  } else {
    lastTags = [apiPath.replace('/', '').split('/')[1]];
  }

  return lastTags;
}

function findDuplicateTypeNames(arr: string[]) {
  const counts = countBy(arr);
  const duplicates = filter(keys(counts), (key) => counts[key] > 1);

  return duplicates;
}

export function handleDuplicateTypeNames(
  interfaceTPConfigs: Array<
    Pick<ITypeItem, 'typeName' | 'displayLabelFuncName' | 'originalSchemaKey'>
  >
): Map<string, string> {
  // 创建从原始 schema key 到最终类型名称的映射
  const schemaKeyToTypeNameMap = new Map<string, string>();

  const duplicateTypeNames = findDuplicateTypeNames(
    map(interfaceTPConfigs, (item) => item.typeName)
  );

  if (!isEmpty(duplicateTypeNames)) {
    forEach(duplicateTypeNames, (typeName) => {
      const selectInterfaceTPConfigs = filter(
        interfaceTPConfigs,
        (interfaceTP) => interfaceTP.typeName === typeName
      );

      forEach(selectInterfaceTPConfigs, (interfaceTP, index) => {
        if (index >= 1) {
          interfaceTP.typeName = `${interfaceTP.typeName}${index + 1}`;

          if (interfaceTP.displayLabelFuncName) {
            interfaceTP.displayLabelFuncName = `${interfaceTP.displayLabelFuncName}${index + 1}`;
          }
        }
      });
    });
  }

  // 建立映射关系（在处理重名之后）
  forEach(interfaceTPConfigs, (interfaceTP) => {
    if (interfaceTP.originalSchemaKey) {
      schemaKeyToTypeNameMap.set(
        interfaceTP.originalSchemaKey,
        interfaceTP.typeName
      );
    }
  });

  return schemaKeyToTypeNameMap;
}

// 检测所有path重复区域（prefix）
export function getBasePrefix(paths: string[]) {
  const arr = [] as string[][];
  paths
    .map((item) => item.split('/'))
    .forEach((pathItem) => {
      pathItem.forEach((item, key) => {
        if (arr.length <= key) {
          arr[key] = [];
        }
        arr[key].push(item);
      });
    });

  const res = [] as string[][];
  arr
    .map((item) => Array.from(new Set(item)))
    .every((item) => {
      const b = item.length === 1;

      if (b) {
        res.push(item);
      }

      return b;
    });

  return `${res.join('/')}/`;
}

// 将地址path路径转为大驼峰
export function genDefaultFunctionName(path: string, pathBasePrefix: string) {
  // 首字母转大写
  function toUpperFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  return path
    ?.replace(pathBasePrefix, '')
    .split('/')
    .map((str) => {
      /**
       * 兼容错误命名如 /user/:id/:name
       * 因为是typeName，所以直接进行转换
       * */
      let s = resolveTypeName(str);

      if (s.includes('-')) {
        s = s.replace(/(-\w)+/g, (_match: string, p1: string) =>
          p1?.slice(1).toUpperCase()
        );
      }

      if (s.match(/^{.+}$/gim)) {
        return `By${toUpperFirstLetter(s.slice(1, s.length - 1))}`;
      }

      return toUpperFirstLetter(s);
    })
    .join('');
}

export function getFinalFileName(s: string): string {
  // 支持下划线、中划线和空格分隔符，注意分隔符枚举值的顺序不能改变，否则正则匹配会报错
  return s.replace(/[-_ ](\w)/g, (_all, letter: string) =>
    letter.toUpperCase()
  );
}

export function replaceDot(s: string) {
  return s
    .replace(/\./g, '_')
    .replace(/[-_ ](\w)/g, (_all, letter: string) => letter.toUpperCase());
}

export function resolveFunctionName(functionName: string, methodName: string) {
  // 类型声明过滤关键字
  if (ReservedDict.check(functionName)) {
    return `${functionName}Using${methodName.toUpperCase()}`;
  }

  return functionName;
}

// 标记引用的 $ref 对应的schema
export function markAllowedSchema(
  schemaStr: string,
  openAPIData: OpenAPIObject
) {
  const refs = map(schemaStr?.match(/"#\/components\/[^"]+"/g), (item) =>
    item.slice(1, -1)
  );

  forEach(refs, (ref) => {
    // const schema = schemas?.[getLastRefName(ref)] as ICustomSchemaObject;
    const refPaths = ref.split('/');
    const schema = resolveRefs(
      openAPIData,
      refPaths.slice(1)
    ) as ICustomSchemaObject;

    if (schema && !schema.isAllowed) {
      schema.isAllowed = true;
      markAllowedSchema(JSON.stringify(schema), openAPIData);
    }
  });
}

export function isReferenceObject(schema: unknown): schema is ReferenceObject {
  return (schema as ReferenceObject)?.$ref !== undefined;
}

export function isSchemaObject(schema: unknown): schema is SchemaObject {
  return (schema as SchemaObject)?.properties !== undefined;
}

export function isNonArraySchemaObject(
  schema: unknown
): schema is NonArraySchemaObject {
  return (
    (schema as NonArraySchemaObject)?.type === 'object' &&
    (schema as NonArraySchemaObject)?.properties !== undefined
  );
}

export function isArraySchemaObject(
  schema: unknown
): schema is ArraySchemaObject {
  return (
    ((schema as ArraySchemaObject)?.type === SchemaObjectType.array ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      (schema as ArraySchemaObject)?.type === SchemaObjectType.stringArray) &&
    (schema as ArraySchemaObject)?.items !== undefined
  );
}

export function isBinaryArraySchemaObject(
  schema: unknown
): schema is BinaryArraySchemaObject {
  return (
    isArraySchemaObject(schema) &&
    ((schema.items as NonArraySchemaObject)?.format === 'binary' ||
      (schema.items as NonArraySchemaObject)?.format === 'base64')
  );
}

export function resolveRefs(obj: OpenAPIObject, fields: string[]) {
  return fields.reduce((acc: unknown, field) => {
    if (!acc) return;

    const s = acc[decodeURIComponent(field)] as NonArraySchemaObject;

    if (!s) return;

    return s;
  }, obj);
}

export function isAllNumeric(arr) {
  return every(arr, (item) => isString(item) && /^-?[0-9]+$/.test(item));
}

// 检查数组每一项是否都是数字
export function isAllNumber(arr) {
  return every(arr, (item) => isNumber(item));
}

export function capitalizeFirstLetter(str: string) {
  return str.replace(/^[a-z]/, (match) => match.toUpperCase());
}

/**
 * 转义字符串，用于 JavaScript 字符串字面量
 * 将换行符、单引号等特殊字符转义为转义序列
 */
export function escapeStringForJs(str: string): string {
  if (!str) return str;
  return str
    .replace(/\\/g, '\\\\') // 先转义反斜杠
    .replace(/'/g, "\\'") // 转义单引号
    .replace(/\n/g, '\\n') // 转义换行符
    .replace(/\r/g, '\\r') // 转义回车符
    .replace(/\t/g, '\\t'); // 转义制表符
}

// 解析 description 中的枚举翻译
export const parseDescriptionEnum = (
  description: string
): Map<number, string> => {
  const enumMap = new Map<number, string>();
  if (!description) return enumMap;

  // 首先处理可能的总体描述，例如 "系统用户角色:User=0,..."
  let descToProcess = description;
  const mainDescriptionMatch = description.match(/^([^:]+):(.*)/);
  if (mainDescriptionMatch) {
    // 如果有总体描述（如 "系统用户角色:"），只处理冒号后面的部分
    descToProcess = mainDescriptionMatch[2];
  }

  // 匹配形如 "User(普通用户)=0" 或 "User=0" 的模式
  const enumPattern = /([^():,=]+)(?:\(([^)]+)\))?=(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = enumPattern.exec(descToProcess)) !== null) {
    const name = match[1] ? match[1].trim() : '';
    const valueStr = match[3] ? match[3].trim() : '';

    if (valueStr && !isNaN(Number(valueStr))) {
      // 统一使用英文key（如User）
      enumMap.set(Number(valueStr), name);
    }
  }

  // 如果没有匹配到任何枚举，尝试使用简单的分割方法作为后备
  if (enumMap.size === 0) {
    const pairs = descToProcess.split(',');
    pairs.forEach((pair) => {
      const parts = pair.split('=');
      if (parts.length === 2) {
        let label = parts[0].trim();
        const value = parts[1].trim();

        // 处理可能带有括号的情况
        const bracketMatch = label.match(/([^(]+)\(([^)]+)\)/);
        if (bracketMatch) {
          // 只使用括号前的英文key
          label = bracketMatch[1].trim();
        }

        if (label && value && !isNaN(Number(value))) {
          enumMap.set(Number(value), label);
        }
      }
    });
  }

  return enumMap;
};

/**
 * 通过自定义正则表达式解析 description 中的枚举翻译
 * @param description 描述文本
 * @param regex 自定义正则表达式，用于匹配枚举项，例如：(\S+)\s*=\s*(\S+)
 * @returns Map<number, string> 枚举值到标签的映射
 */
export const parseDescriptionEnumByReg = (
  description: string,
  regex: string | RegExp
): Map<number, string> => {
  const enumMap = new Map<number, string>();
  if (!description) return enumMap;

  // 将字符串正则转换为 RegExp 对象，确保有全局标志
  let regExp: RegExp;
  if (typeof regex === 'string') {
    const flagsMatch = regex.match(/\/([gimsuy]*)$/);
    if (flagsMatch) {
      const parts = regex.split('/');
      const pattern = parts.slice(1, -1).join('/');
      const flags = flagsMatch[1] || '';
      regExp = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    } else {
      regExp = new RegExp(regex, 'g');
    }
  } else {
    const flags = regex.flags;
    regExp = flags.includes('g')
      ? regex
      : new RegExp(regex.source, flags + 'g');
  }

  // 匹配所有结果，然后对每个匹配结果按 = 拆分
  let match: RegExpExecArray | null;
  while ((match = regExp.exec(description)) !== null) {
    const fullMatch = match[0].trim();
    // 按 = 拆分，左边是标签，右边是值
    const parts = fullMatch.split(/\s*=\s*/);
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const valueStr = parts[1].trim();
      const numValue = Number(valueStr);
      if (label && valueStr && !isNaN(numValue)) {
        enumMap.set(numValue, label);
      }
    }
  }

  return enumMap;
};

/**
 * 获取默认的二进制媒体类型列表
 */
export const getDefaultBinaryMediaTypes = (): string[] => {
  return [
    'application/octet-stream',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/*',
    'video/*',
    'audio/*',
  ];
};

/**
 * 获取二进制媒体类型列表
 * 支持配置自定义二进制媒体类型
 * @param customBinaryTypes 自定义二进制媒体类型列表
 */
export const getBinaryMediaTypes = (
  customBinaryTypes: string[] = []
): string[] => {
  const defaultBinaryTypes = getDefaultBinaryMediaTypes();
  return [...defaultBinaryTypes, ...customBinaryTypes];
};

/**
 * 检测是否为二进制媒体类型
 * @param mediaType 媒体类型
 * @param binaryMediaTypes 二进制媒体类型列表
 */
export const isBinaryMediaType = (
  mediaType: string,
  binaryMediaTypes: string[]
): boolean => {
  return binaryMediaTypes.some((type) => {
    if (type.endsWith('/*')) {
      // 处理通配符类型，如 image/*, video/*
      const prefix = type.slice(0, -1);
      return mediaType.startsWith(prefix);
    }
    return mediaType === type;
  });
};

/**
 * 获取二进制响应类型
 * 默认返回 Blob，这是浏览器环境中最常用的二进制类型
 */
export const getBinaryResponseType = (): string => {
  return 'Blob';
};

/**
 * 获取 axios responseType 配置
 * 根据二进制响应类型返回对应的 responseType
 * @param binaryType 二进制类型
 */
export const getAxiosResponseType = (binaryType: string): string => {
  switch (binaryType.toLowerCase()) {
    case 'blob':
      return 'blob';
    case 'arraybuffer':
      return 'arraybuffer';
    case 'uint8array':
      return 'arraybuffer'; // Uint8Array 需要从 ArrayBuffer 转换
    case 'buffer':
      return 'arraybuffer'; // Node.js Buffer 需要从 ArrayBuffer 转换
    default:
      return 'blob';
  }
};
