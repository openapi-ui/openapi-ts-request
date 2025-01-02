import axios from 'axios';
import { translate } from 'bing-translate-api';
import http from 'http';
import https from 'https';
import * as yaml from 'js-yaml';
import { camelCase, forEach, isObject, keys, map, uniq } from 'lodash';
import { readFileSync } from 'node:fs';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import converter from 'swagger2openapi';

import log from './log';
import { OpenAPIObject, OperationObject } from './type';

export const getImportStatement = (requestLibPath: string) => {
  if (requestLibPath) {
    if (requestLibPath.startsWith('import')) {
      return requestLibPath;
    }

    return `import request from '${requestLibPath}';`;
  }

  return `import { request } from 'axios';`;
};

async function getSchema(schemaPath: string, authorization?: string) {
  if (schemaPath.startsWith('http')) {
    const isHttps = schemaPath.startsWith('https:');
    const protocol = isHttps ? https : http;

    try {
      const agent = new protocol.Agent({
        rejectUnauthorized: false,
      });
      const config = isHttps ? { httpsAgent: agent } : { httpAgent: agent };
      const json = await axios
        .get(schemaPath, {
          ...config,
          headers: { authorization },
        })
        .then((res) => res.data as OpenAPI.Document);

      return json;
    } catch (error) {
      console.log('fetch openapi error:', error);
    }

    return;
  }

  if (require.cache[schemaPath]) {
    delete require.cache[schemaPath];
  }

  let schema: string | OpenAPI.Document = '';

  try {
    schema = (await require(schemaPath)) as OpenAPI.Document;
  } catch {
    try {
      schema = readFileSync(schemaPath, 'utf8');
    } catch (error) {
      console.error('Error reading schema file:', error);
    }
  }

  return schema;
}

function converterSwaggerToOpenApi(swagger: OpenAPI.Document) {
  return new Promise<OpenAPIV3.Document>((resolve, reject) => {
    const convertOptions = {
      patch: true,
      warnOnly: true,
      resolveInternal: true,
    };
    // options.patch = true; // fix up small errors in the source definition
    // options.warnOnly = true; // Do not throw on non-patchable errors
    // options.warnOnly = true; // enable resolution of internal $refs, also disables deduplication of requestBodies
    converter.convertObj(
      swagger as OpenAPIV2.Document,
      convertOptions,
      (err, options) => {
        log(['💺 将 Swagger 转化为 openAPI']);

        if (err) {
          return reject(err);
        }

        resolve(options.openapi);
      }
    );
  });
}

export const getOpenAPIConfig = async (
  schemaPath: string,
  authorization?: string
) => {
  const schema = await getSchema(schemaPath, authorization);

  if (!schema) {
    return;
  }

  const openAPI = await parseSwaggerOrOpenapi(schema);

  return openAPI;
};

export async function parseSwaggerOrOpenapi(
  content: string | OpenAPI.Document
) {
  let openapi = {} as OpenAPI.Document;

  if (isObject(content)) {
    openapi = content;

    // if is swagger2.0 json, covert swagger2.0 to openapi3.0
    if ((openapi as OpenAPIV2.Document).swagger) {
      openapi = await converterSwaggerToOpenApi(openapi);
    }
  } else {
    if (isJSONString(content)) {
      openapi = JSON.parse(content) as OpenAPI.Document;
    } else {
      openapi = yaml.load(content) as OpenAPI.Document;
    }

    if ((openapi as OpenAPIV2.Document).swagger) {
      openapi = await converterSwaggerToOpenApi(openapi);
    }
  }

  return openapi;
}

function isJSONString(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

export async function translateChineseModuleNodeToEnglish(
  openAPI: OpenAPIObject
) {
  return new Promise((resolve, reject) => {
    const translateMap: Record<string, string> = {};
    const operations = [] as OperationObject[];
    let tags: string[] = [];

    forEach(keys(openAPI.paths), (path) => {
      const pathItemObject = openAPI.paths[path];

      forEach(keys(pathItemObject), (method: string) => {
        if (pathItemObject[method]) {
          const operation = pathItemObject[method] as OperationObject;
          operations.push(operation);
          tags = tags.concat(operation.tags);
        }
      });
    });

    void Promise.all(
      map(uniq(tags), (tagName) => {
        return new Promise((resolve) => {
          if (tagName && /[\u3220-\uFA29]/.test(tagName)) {
            void translate(tagName, null, 'en')
              .then((translateRes) => {
                const text = camelCase(translateRes?.translation);

                if (text) {
                  translateMap[tagName] = text;
                  resolve(text);
                }
              })
              .catch(() => {
                resolve(tagName);
              });
          } else {
            resolve(tagName);
          }
        });
      })
    )
      .then(() => {
        forEach(operations, (operation) => {
          forEach(operation.tags, (tagName, index) => {
            if (translateMap[tagName]) {
              operation.tags[index] = translateMap[tagName];
            }
          });
        });
        resolve(true);
      })
      .catch(() => {
        reject(false);
      });
  });
}
