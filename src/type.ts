import type { OpenAPIV3 } from 'openapi-types';

import type {
  PriorityRule,
  ReactQueryMode,
  SchemaObjectFormat,
  SchemaObjectType,
} from './config';

export type MutuallyExclusive<T> = {
  [K in keyof T]: { [P in K]: T[K] } & { [P in Exclude<keyof T, K>]?: never };
}[keyof T];

export type MutuallyExclusiveWithFallback<T, N> = {
  [K in keyof T]: { [P in K]: T[K] } & { [P in Exclude<keyof T, K>]?: N };
}[keyof T];

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
  'x-apifox-enum'?: {
    value: string;
    name: string;
    description: string;
  }[];
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

export type ISchemaObjectFormat = keyof typeof SchemaObjectFormat;

export type GenerateRegExp = {
  includeTags: (string | RegExp)[];
  excludeTags: (string | RegExp)[];
  includePaths: (string | RegExp)[];
  excludePaths: (string | RegExp)[];
};

export type ISchemaObjectType = keyof typeof SchemaObjectType;

export type IReactQueryMode = keyof typeof ReactQueryMode;

export type IPriorityRule = keyof typeof PriorityRule;

export type ReadConfigOptions = MutuallyExclusiveWithFallback<
  {
    fileName: string;
    filePath: string;
  },
  undefined
> & { fallbackName: string };

export interface APIFoxBody {
  scope?: {
    type?: 'ALL' | 'SELECTED_TAGS';
    includeTags?: string[];
    excludeTags?: string[];
  };
  options?: {
    includeApifoxExtensionProperties?: boolean;
    addFoldersToTags?: boolean;
  };
  oasVersion?: '2.0' | '3.0' | '3.1';
  exportFormat?: 'JSON' | 'YAML';
  environmentIds?: string[];
}

export interface GetSchemaByApifoxProps
  extends Pick<APIFoxBody, 'oasVersion' | 'exportFormat'>,
    Pick<
      APIFoxBody['options'],
      'includeApifoxExtensionProperties' | 'addFoldersToTags'
    > {
  projectId: string;
  apifoxToken: string;
  locale?: string;
  apifoxVersion?: string;
  includeTags?: (string | RegExp)[];
  excludeTags?: string[];
}
