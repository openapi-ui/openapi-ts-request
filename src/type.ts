import { OpenAPIV3 } from 'openapi-types';

type Modify<T, R> = Omit<T, keyof R> & R;

type ICustomBaseSchemaObject = {
  type: ISchemaObjectType;
  format?: ISchemaObjectFormat;
  additionalProperties?: boolean | ISchemaObject;
  properties?: {
    [name: string]: ISchemaObject;
  };
  allOf?: ISchemaObject[];
  oneOf?: ISchemaObject[];
  anyOf?: ISchemaObject[];
  'x-enum-varnames'?: string[];
  'x-enum-comments'?: {
    [name: string]: string;
  };
  'x-apifox'?: {
    enumDescriptions: Record<string, string>;
  };
};

export type ArraySchemaObject = Modify<
  OpenAPIV3.ArraySchemaObject,
  ICustomBaseSchemaObject & {
    items: ISchemaObject;
  }
>;

export type BinaryArraySchemaObject = ArraySchemaObject;

export type NonArraySchemaObject = Modify<
  OpenAPIV3.NonArraySchemaObject,
  ICustomBaseSchemaObject
>;

export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

export type ISchemaObject = SchemaObject | ReferenceObject;

export type ReferenceObject = OpenAPIV3.ReferenceObject;

export type PathItemObject = Modify<
  OpenAPIV3.PathItemObject,
  {
    parameters?: (ReferenceObject | ParameterObject)[];
  }
>;

export type OperationObject = Modify<
  OpenAPIV3.OperationObject,
  {
    parameters?: (ReferenceObject | ParameterObject)[];
  }
> & { 'x-run-in-apifox'?: string };

export type ComponentsObject = OpenAPIV3.ComponentsObject;

export type OpenAPIObject = OpenAPIV3.Document;

export type ParameterObject = Modify<
  OpenAPIV3.ParameterObject,
  {
    schema?: ISchemaObject;
  }
>;

export type ResponsesObject = OpenAPIV3.ResponsesObject;

export type ResponseObject = OpenAPIV3.ResponseObject & { example?: unknown };

export type RequestBodyObject = OpenAPIV3.RequestBodyObject;

export type ContentObject = {
  [media: string]: OpenAPIV3.MediaTypeObject;
};

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

export type ISchemaObjectFormat = keyof typeof SchemaObjectFormat;

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

export type GenerateRegExp = {
  includeTags: (string | RegExp)[];
  excludeTags: (string | RegExp)[];
  includePaths: (string | RegExp)[];
  excludePaths: (string | RegExp)[];
};

export type ISchemaObjectType = keyof typeof SchemaObjectType;
