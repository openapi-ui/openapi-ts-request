import { OperationObject, ParameterObject, SchemaObject } from '../type';
import { TypescriptFileType } from './config';

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
