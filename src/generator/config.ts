import { Dictionary } from 'lodash';

import { ParameterObject, SchemaObject } from '../type';

export const serviceEntryFileName = 'index';

export const interfaceFileName = 'types';

export const displayEnumLabelFileName = 'displayEnumLabel';

export enum TypescriptFileType {
  interface = 'interface',
  serviceController = 'serviceController',
  serviceIndex = 'serviceIndex',
  displayEnumLabel = 'displayEnumLabel',
}

export const DEFAULT_SCHEMA: SchemaObject = {
  type: 'object',
  properties: { id: { type: 'number' } },
};

export const DEFAULT_PATH_PARAM: ParameterObject & Dictionary<unknown> = {
  in: 'path',
  name: null,
  schema: {
    type: 'string',
  },
  required: true,
  isObject: false,
  type: 'string',
};

export enum methods {
  get = 'get',
  put = 'put',
  post = 'post',
  delete = 'delete',
  patch = 'patch',
}

// Possible values are "query", "path", "file", "header", "cookie". (https://swagger.io/specification/)
export enum parametersInsEnum {
  query = 'query',
  path = 'path',
  cookie = 'cookie',
  header = 'header',
  file = 'file',
}

export const parametersIn = ['query', 'path', 'cookie'];

export const numberEnum = [
  'integer',
  'long',
  'float',
  'double',
  'number',
  'int',
  'float',
  'double',
  'int32',
  'int64',
];
