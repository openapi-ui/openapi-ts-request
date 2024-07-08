import {
  Dictionary,
  countBy,
  filter,
  forEach,
  isArray,
  isBoolean,
  isEmpty,
  isNull,
  isObject,
  isUndefined,
  keys,
  map,
} from 'lodash';
import ReservedDict from 'reserved-words';
import pinyin from 'tiny-pinyin';

import log from '../log';
import {
  ArraySchemaObject,
  BinaryArraySchemaObject,
  ComponentsObject,
  ISchemaObject,
  NonArraySchemaObject,
  OperationObject,
  ReferenceObject,
  SchemaObject,
} from '../type';
import { numberEnum } from './config';
import { ICustomSchemaObject, ITypeItem } from './type';

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
    return name;
  }

  const noBlankName = name.replace(/ +/g, '');

  return pinyin.convertToPinyin(noBlankName, '', true);
}

function getRefName(refObject: ReferenceObject | string) {
  if (!isReferenceObject(refObject)) {
    return refObject;
  }

  const refPaths = refObject.$ref.split('/');

  return resolveTypeName(refPaths[refPaths.length - 1]);
}

export function getDefaultType(
  schemaObject?: ISchemaObject | string,
  namespace: string = '',
  schemas?: ComponentsObject['schemas']
): string {
  if (isUndefined(schemaObject) || isNull(schemaObject)) {
    return 'unknown';
  }

  if (!isObject(schemaObject)) {
    return schemaObject;
  }

  if (isReferenceObject(schemaObject)) {
    return [namespace, getRefName(schemaObject)].filter((s) => s).join('.');
  }

  let type = schemaObject?.type;
  const dateEnum = ['Date', 'date', 'dateTime', 'date-time', 'datetime'];
  const stringEnum = ['string', 'email', 'password', 'url', 'byte', 'binary'];

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
          getDefaultType((subType.schema || subType) as SchemaObject, namespace)
        )
        .toString();

      return `[${arrayItemType}]`;
    }

    const arrayType = getDefaultType(items, namespace);

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
      .map((item) => getDefaultType(item, namespace))
      .join(' | ');
  }

  if (schemaObject.anyOf?.length) {
    return schemaObject.anyOf
      .map((item) => getDefaultType(item, namespace))
      .join(' | ');
  }

  if (schemaObject.allOf?.length) {
    const allofList = schemaObject.allOf.map((item) => {
      if (isReferenceObject(item)) {
        // 不使用 getRefName 函数处理，无法通过 schemas[schemaKey] 获取到schema
        const refPaths = item.$ref.split('/');
        const schemaKey = refPaths[refPaths.length - 1];

        if ((schemas?.[schemaKey] as SchemaObject)?.enum) {
          return `I${getDefaultType(item, namespace)}`;
        }
      }

      return getDefaultType(item, namespace);
    });

    return `(${allofList.join(' & ')})`;
  }

  if (schemaObject.type === 'object' || schemaObject.properties) {
    if (!keys(schemaObject.properties).length) {
      return 'Record<string, unknown>';
    }

    return `{ ${keys(schemaObject.properties)
      .map((key) => {
        let required = false;

        if (isBoolean(schemaObject.required) && schemaObject.required) {
          required = true;
        }

        if (
          isArray(schemaObject.required) &&
          schemaObject.required.includes(key)
        ) {
          required = true;
        }

        if (
          'required' in (schemaObject.properties[key] || {}) &&
          (schemaObject.properties[key] as SchemaObject)?.required
        ) {
          required = true;
        }
        /**
         * 将类型属性变为字符串，兼容错误格式如：
         * 3d_tile(数字开头)等错误命名，
         * 在后面进行格式化的时候会将正确的字符串转换为正常形式，
         * 错误的继续保留字符串。
         * */
        return `'${key}'${required ? '' : '?'}: ${getDefaultType(
          schemaObject.properties?.[key],
          namespace
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
  return operationObject['x-swagger-router-controller']
    ? [operationObject['x-swagger-router-controller'] as string]
    : operationObject.tags || [operationObject.operationId] || [
          apiPath.replace('/', '').split('/')[1],
        ];
}

function findDuplicateTypeNames(arr: string[]) {
  const counts = countBy(arr);
  const duplicates = filter(keys(counts), (key) => counts[key] > 1);

  return duplicates;
}

export function handleDuplicateTypeNames(
  interfaceTPConfigs: Array<
    Pick<ITypeItem, 'typeName' | 'displayLabelFuncName'>
  >
) {
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
export function markAllowSchema(
  schemaStr: string,
  schemas: ComponentsObject['schemas']
) {
  const refs = schemaStr?.match(/#\/components\/schemas\/([A-Za-z0-9._-]+)/g);

  forEach(refs, (ref) => {
    const refPaths = ref.split('/');
    const schema = schemas?.[
      refPaths[refPaths.length - 1]
    ] as ICustomSchemaObject;

    if (!schema?.isAllowed) {
      schema.isAllowed = true;
      markAllowSchema(JSON.stringify(schema), schemas);
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
    ((schema as ArraySchemaObject)?.type === 'array' ||
      (schema as ArraySchemaObject)?.type === 'stringArray') &&
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
