import { isArray, isObject } from 'lodash';
import type { OpenAPIV3 } from 'openapi-types';

import { isSchemaObject } from '../generator/util';
import type {
  OpenAPIObject,
  ParameterObject,
  ReferenceObject,
  SchemaObject,
} from '../type';

export function objectify<T>(thing: T) {
  if (!isObject(thing)) return {} as T;

  return thing;
}

export function get(openAPI: OpenAPIObject, path: string) {
  const refPaths = path.split('/');
  const schema = openAPI.components?.schemas?.[refPaths[refPaths.length - 1]];

  if (!schema) {
    return null;
  }

  return schema;
}

export function normalizeArray(arr: string[] | string) {
  if (isArray(arr)) return arr;

  return [arr];
}

function isParameterObject(thing: unknown): thing is ParameterObject {
  return (thing as ParameterObject)?.schema !== undefined;
}

export function inferSchema(
  thing:
    | ParameterObject
    | SchemaObject
    | ReferenceObject
    | OpenAPIV3.MediaTypeObject
) {
  if (isParameterObject(thing)) {
    return thing.schema;
  }

  if (isSchemaObject(thing)) {
    return {
      ...thing,
      type: 'object',
    };
  }

  return thing;
}

export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);

  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
