import type { ProjectOptions } from 'ts-morph';

import type { OperationObject, ParameterObject, SchemaObject } from '../type';
import { type MutuallyExclusive } from '../type';
import type { TypescriptFileType } from './config';

export type ITypescriptFileType = keyof typeof TypescriptFileType;

export interface APIDataType extends OperationObject {
  path: string;
  method: string;
}

export type TagAPIDataType = Record<string, APIDataType[]>;

export interface ControllerType {
  fileName: string;
  controllerName: string;
}

export interface IPropBasicObject {
  name: string;
  desc: string;
  required?: boolean;
  type: string;
}

export type IPropObject = IPropBasicObject &
  Partial<Omit<SchemaObject, 'type' | 'required'>>;

export interface ITypeItem {
  typeName: string;
  type: string | boolean | SchemaObject;
  props: IPropObject[][];
  isEnum: boolean;
  displayLabelFuncName?: string;
  enumLabelType?: string;
  description?: string;
}

export type ICustomSchemaObject = SchemaObject & { isAllowed?: boolean };

export type ICustomParameterObject = ParameterObject & {
  isObject: boolean;
  type: string;
};

export interface ISchemaItem {
  typeName: string;
  type: string;
}

export enum MergeRule {
  LEFT = 'left',
  RIGHT = 'right',
}

export type MergeOption = MutuallyExclusive<{
  source: string;
  srcPath: string;
}>;

type MergerOptionProps = {
  mergeRule: MergeRule;
  projectOptions: ProjectOptions;
};

export type MergerOptions = MergeOption & Partial<MergerOptionProps>;

export type IServiceControllerPayload<T> = {
  namespace: string;
  requestOptionsType: string;
  requestImportStatement: string;
  interfaceFileName: string;
  list:
    | {
        customTemplate: boolean;
        data: string;
      }[]
    | T;
};
