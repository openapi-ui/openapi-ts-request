import type { Dictionary } from 'lodash';
import {
  forEach,
  has,
  isEmpty,
  isObject,
  mapValues,
  omit,
  reduce,
  replace,
  startsWith,
  uniq,
} from 'lodash';

import type { ComponentsObject, ISchemaObject, SchemaObject } from '../type';
import {
  isArraySchemaObject,
  isNonArraySchemaObject,
  isReferenceObject,
} from './util';

export function patchSchema<T extends object>(
  schema: ISchemaObject,
  schemas: ComponentsObject['schemas']
): T {
  if (isEmpty(schema)) {
    return {} as T;
  }

  if (has(schema, 'allOf')) {
    return reduce(
      schema.allOf as SchemaObject[],
      (last, s) => {
        const f: Dictionary<unknown> = {
          ...(last || {}),
        };
        const next = patchSchema<T>(s, schemas);

        forEach(next, (v, k) => {
          switch (k) {
            case 'properties':
              f[k] = {
                ...(f[k] as object),
                ...(v || {}),
              };
              break;
            case 'required':
              f[k] = uniq(((f[k] || []) as unknown[]).concat(v));
              break;
            default: {
              f[k] = v;
            }
          }
        });
        return f;
      },
      omit(schema, 'allOf')
    ) as T;
  }

  if (
    isReferenceObject(schema) &&
    startsWith(schema.$ref, '#/components/schemas/')
  ) {
    const refId =
      replace(schema.$ref, '#/components/schemas/', '') ||
      (schema['x-id'] as string);

    if (schemas[refId]) {
      return {
        ...schema,
        ...patchSchema<T>(schemas[refId] as ISchemaObject, schemas),
        'x-id': refId,
        $ref: undefined,
      } as T;
    }
  }

  if (isNonArraySchemaObject(schema)) {
    const patchedProperties = mapValues(schema.properties, (propSchema) =>
      patchSchema<T>(propSchema, schemas)
    );

    if (isObject(schema.additionalProperties)) {
      const additionalProperties = patchSchema<T>(
        schema.additionalProperties,
        schemas
      );

      return {
        ...schema,
        additionalProperties,
      } as T;
    }

    return {
      ...schema,
      properties: patchedProperties,
    } as T;
  }

  if (isArraySchemaObject(schema)) {
    return {
      ...schema,
      items: patchSchema<T>(schema.items, schemas),
    } as T;
  }

  return schema as T;
}
