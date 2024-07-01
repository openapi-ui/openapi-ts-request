import { isObject, isUndefined, keys } from 'lodash';
import memoizee from 'memoizee';
import { OpenAPIV3 } from 'openapi-types';

import { isReferenceObject } from '../generator/util';
import {
  ArraySchemaObject,
  ISchemaObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  ResponseObject,
} from '../type';
import { primitives } from './primitives';
import {
  get,
  getRandomInt,
  inferSchema,
  normalizeArray,
  objectify,
} from './util';

function getDateByName(name: string | string[], parentsKey?: string[]): string {
  if (!name || name.length < 1) {
    return 'string';
  }

  if (Array.isArray(name)) {
    return getDateByName([...name].pop(), name);
  }

  if (['nickname', 'name'].includes(name)) {
    return 'cname';
  }

  if (['owner', 'firstName', 'lastName', 'username'].includes(name)) {
    return 'name';
  }

  if (['avatar'].includes(name)) {
    return 'avatar';
  }

  if (['group'].includes(name)) {
    return 'group';
  }

  if (name.toLocaleLowerCase().endsWith('id')) {
    return 'uuid';
  }

  if (
    name.toLocaleLowerCase().endsWith('type') ||
    name.toLocaleLowerCase().endsWith('key') ||
    ['key'].includes(name)
  ) {
    return 'id';
  }

  if (name.toLocaleLowerCase().endsWith('label') || ['label'].includes(name)) {
    const newParents = [...parentsKey];
    newParents.pop();
    const newType = getDateByName(newParents);

    if (newType !== 'string' && newType !== 'csentence') {
      return newType;
    }

    return 'label';
  }

  if (['email'].includes(name)) {
    return 'email';
  }

  if (['password'].includes(name)) {
    return 'string(16)';
  }

  if (['phone'].includes(name)) {
    return 'phone';
  }

  if (['province'].includes(name)) {
    return 'province';
  }

  if (['city'].includes(name)) {
    return 'city';
  }

  if (['addr', 'address'].includes(name)) {
    return 'county';
  }

  if (['country'].includes(name)) {
    return 'country';
  }

  if (
    ['url', 'imageUrl', 'href'].includes(name) ||
    name.toLocaleLowerCase().endsWith('url') ||
    name.toLocaleLowerCase().endsWith('urls') ||
    name.toLocaleLowerCase().endsWith('image') ||
    name.toLocaleLowerCase().endsWith('link')
  ) {
    return 'href';
  }

  if (name.toLocaleLowerCase().endsWith('errorcode')) {
    return 'errorCode';
  }

  if (
    ['type', 'status'].includes(name) ||
    name.toLocaleLowerCase().endsWith('status') ||
    name.toLocaleLowerCase().endsWith('type')
  ) {
    return 'status';
  }

  if (name.toLocaleLowerCase().endsWith('authority')) {
    return 'authority';
  }

  return 'csentence';
}

function primitive(
  schemaParams: ArraySchemaObject,
  propsName: string | string[]
) {
  const schema = objectify(schemaParams);
  const { type, format } = schema;
  const value =
    primitives[`${type}_${format || getDateByName(propsName)}`] ||
    primitives[type];

  if (isUndefined(schema.example)) {
    return value || `Unknown Type: ${schema.type}`;
  }

  return schema.example as string;
}

export default class OpenAPIGeneratorMockJs {
  protected openAPI: OpenAPIObject;

  constructor(openAPI: OpenAPIObject) {
    this.openAPI = openAPI;
    this.sampleFromSchema = memoizee(this.sampleFromSchema);
  }

  private sampleFromSchema = (
    schema: ISchemaObject | OpenAPIV3.MediaTypeObject,
    propsName?: string[],
    schemaSet: Set<string> = new Set()
  ):
    | Record<string, unknown>
    | string
    | null
    | (Record<string, unknown> | string | null)[] => {
    const schemaRef = isReferenceObject(schema) ? schema.$ref : null;

    if (schemaRef) {
      // 如果之前已经使用过该引用结构，直接返回null,不然会陷入无限递归的情况
      if (schemaSet.has(schemaRef)) {
        return null;
      } else {
        schemaSet.add(schemaRef);
      }
    }

    const localSchema = (
      schemaRef ? get(this.openAPI, schemaRef) : objectify(schema)
    ) as ArraySchemaObject;

    let type = localSchema.type;
    const { properties, additionalProperties, items, anyOf, oneOf, allOf } =
      localSchema;

    if (allOf) {
      let obj = {};
      allOf.forEach((item) => {
        const newObj = this.sampleFromSchema(
          item,
          propsName,
          new Set(schemaSet)
        );

        if (isObject(newObj)) {
          obj = {
            ...obj,
            ...newObj,
          };
        }
      });

      return obj;
    }

    if (!type) {
      if (properties) {
        type = 'object';
      } else if (items) {
        type = 'array';
      } else if (anyOf || oneOf) {
        type = 'union';
      } else {
        return null;
      }
    }

    if (type === 'null') {
      return null;
    }

    if (type === 'object') {
      const props = objectify(properties);
      const obj: Record<string, unknown> = {};

      for (const name in props) {
        obj[name] = this.sampleFromSchema(
          props[name],
          [...(propsName || []), name],
          new Set(schemaSet)
        );
      }

      if (additionalProperties === true) {
        obj.additionalProp1 = {};

        return obj;
      }

      if (additionalProperties) {
        const additionalProps = objectify(additionalProperties);
        const additionalPropVal = this.sampleFromSchema(
          additionalProps,
          propsName,
          new Set(schemaSet)
        );

        for (let i = 1; i < 4; i += 1) {
          obj[`additionalProp${i}`] = additionalPropVal;
        }
      }

      return obj;
    }

    if (type === 'array') {
      const item = this.sampleFromSchema(items, propsName, new Set(schemaSet));

      return new Array(parseInt((Math.random() * 20).toFixed(0), 10)).fill(
        item
      ) as (Record<string, unknown> | string | null)[];
    }

    if (type === 'union') {
      const subschemas = anyOf || oneOf;
      const subschemas_length = (subschemas && subschemas.length) || 0;

      if (subschemas_length) {
        const index = getRandomInt(0, subschemas_length);
        const obj = this.sampleFromSchema(
          subschemas[index],
          propsName,
          new Set(schemaSet)
        );

        return obj;
      }
    }

    if (localSchema.enum) {
      if (localSchema.default) {
        return localSchema.default as string;
      }

      return normalizeArray(localSchema.enum)[0];
    }

    if (type === 'file') {
      return null;
    }

    return primitive(localSchema, propsName);
  };

  public parser() {
    const openAPI = {
      ...this.openAPI,
    };

    for (const path in openAPI.paths) {
      for (const method in openAPI.paths[path]) {
        const api = openAPI.paths[path][method] as OperationObject;

        for (const code in api.responses) {
          const response = api.responses[code] as ResponseObject;

          const mediaTypeKeys = keys(response.content);
          if (mediaTypeKeys.length) {
            let key: string;

            if (mediaTypeKeys.includes('application/json')) {
              key = 'application/json';
            } else if (mediaTypeKeys.includes('*/*')) {
              key = '*/*';
            } else {
              key = mediaTypeKeys[0];
            }

            const schema = inferSchema(response.content[key]);

            if (schema) {
              response.example = this.sampleFromSchema(schema);
            }
          }
        }

        if (!api.parameters) continue;

        for (const parameter of api.parameters) {
          const schema = inferSchema(parameter);
          (parameter as ParameterObject).example = schema
            ? this.sampleFromSchema(schema)
            : null;
        }
      }
    }

    return openAPI;
  }
}
