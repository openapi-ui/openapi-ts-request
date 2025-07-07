import type { IReactQueryMode } from './type';

export enum SchemaObjectFormat {
  int32 = 'int32',
  int64 = 'int64',
  float = 'float',
  double = 'double',
  byte = 'byte',
  binary = 'binary',
  date = 'date',
  dateTime = 'date-time',
  password = 'password',
  base64 = 'base64',
}

export enum SchemaObjectType {
  array = 'array',
  stringArray = 'string[]',
  boolean = 'boolean',
  object = 'object',
  number = 'number',
  string = 'string',
  integer = 'integer',
  enum = 'enum',
  null = 'null',
  union = 'union',
  file = 'file',
}

export enum PriorityRule {
  include = 'include',
  exclude = 'exclude',
  both = 'both',
}

export enum ReactQueryMode {
  react = 'react',
  vue = 'vue',
}

export const displayReactQueryMode = (mode: IReactQueryMode) => {
  return {
    react: '@tanstack/react-query',
    vue: '@tanstack/vue-query',
  }[mode];
};
