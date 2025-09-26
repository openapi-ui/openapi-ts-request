import axios from 'axios';
import { translate } from 'bing-translate-api';
import http from 'http';
import https from 'https';
import * as yaml from 'js-yaml';
import {
  camelCase as _camelCase_,
  forEach,
  isEmpty,
  isObject,
  keys,
  map,
  uniq,
} from 'lodash';
import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import converter from 'swagger2openapi';

import log, { logError } from './log';
import type { OpenAPIObject, OperationObject } from './type';
import { type APIFoxBody, type GetSchemaByApifoxProps } from './type';

export const getImportStatement = (requestLibPath: string) => {
  if (requestLibPath) {
    if (requestLibPath.startsWith('import')) {
      return requestLibPath;
    }

    return `import request from '${requestLibPath}';`;
  }

  return `import request from 'axios';`;
};

/**
 * 通过 apifox 获取 openapi 文档
 * @param params {object}
 * @param params.projectId {string} 项目 id
 * @param params.locale {string} 语言
 * @param params.apifoxVersion {string} apifox 版本 目前固定为 2024-03-28 可通过 https://api.apifox.com/v1/versions 获取最新版本
 * @returns
 */
const getSchemaByApifox = async ({
  projectId,
  locale = 'zh-CN',
  apifoxVersion = '2024-03-28',
  selectedTags,
  excludedByTags = [],
  apifoxToken,
  oasVersion = '3.0',
  exportFormat = 'JSON',
  includeApifoxExtensionProperties = false,
  addFoldersToTags = false,
}: GetSchemaByApifoxProps): Promise<OpenAPI.Document | null> => {
  try {
    const body: APIFoxBody = {
      scope: {
        excludedByTags,
      },
      options: {
        includeApifoxExtensionProperties,
        addFoldersToTags,
      },
      oasVersion,
      exportFormat,
    };
    const tags = !isEmpty(selectedTags) ? selectedTags : '*';

    if (tags === '*') {
      body.scope.type = 'ALL';
    } else {
      body.scope.type = 'SELECTED_TAGS';
      body.scope.selectedTags = tags;
    }

    const res = await axios.post(
      `https://api.apifox.com/v1/projects/${projectId}/export-openapi?locale=${locale}`,
      body,
      {
        headers: {
          'X-Apifox-Api-Version': apifoxVersion,
          Authorization: `Bearer ${apifoxToken}`,
        },
      }
    );

    return res.data as OpenAPI.Document;
  } catch (error) {
    logError('fetch openapi error:', error);
    return null;
  }
};

async function getSchema(
  schemaPath: string,
  authorization?: string,
  timeout?: number
) {
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
          timeout,
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

export const getOpenAPIConfigByApifox = async (
  props: GetSchemaByApifoxProps
) => {
  const schema = await getSchemaByApifox(props);

  if (!schema) {
    return;
  }

  return await parseSwaggerOrOpenapi(schema);
};

export const getOpenAPIConfig = async (
  schemaPath: string,
  authorization?: string,
  timeout?: number
) => {
  const schema = await getSchema(schemaPath, authorization, timeout);

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

function readFileSafelySync(filePath: string) {
  if (!existsSync(filePath)) {
    logError(`文件 ${filePath} 不存在`);
    return null;
  }

  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    logError(`读取文件 ${filePath} 时出错:`, error);
    return null;
  }
}

async function writeFileAsync(filePath: string, content: string) {
  try {
    await writeFile(filePath, content, 'utf8');
  } catch (error) {
    logError(`文件 ${filePath} 写入失败`);
  }
}

export async function translateChineseModuleNodeToEnglish(
  openAPI: OpenAPIObject
) {
  const content = readFileSafelySync(
    process.cwd() + '/openapi-ts-request.cache.json'
  );
  let i18n: Record<string, string> | null = {};

  if (content !== null) {
    if (isJSONString(content)) {
      i18n = JSON.parse(content) as Record<string, string>;
    }
  }

  return new Promise<Record<string, string> | boolean>((resolve, reject) => {
    const translateMap: Record<string, string> = i18n;
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
          if (tagName && /[\u3220-\uFA29]/.test(tagName) && !i18n[tagName]) {
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
        resolve(translateMap);
        void writeFileAsync(
          process.cwd() + '/openapi-ts-request.cache.json',
          JSON.stringify(translateMap, null, 2)
        );
      })
      .catch(() => {
        reject(false);
      });
  });
}

/**
 * Converts a string to camelCase format, with an option to capitalize the first letter.
 * 将字符串转换为驼峰格式，并可以选择将首字母大写。
 *
 * @param {string} str - The string to convert.
 * @param {string} str - 要转换的字符串。
 *
 * @param {boolean} [upper=false] - Whether to capitalize the first letter of the resulting string.
 * @param {boolean} [upper=false] - 是否将结果字符串的首字母大写。
 *
 * @returns {string} The camelCase formatted string, optionally with a capitalized first letter.
 * @returns {string} 返回驼峰格式的字符串，可选择首字母大写。
 */
export const camelCase = (str: string, upper: boolean = false) => {
  const res = _camelCase_(str);
  return upper ? res.charAt(0).toUpperCase() + res.slice(1) : res;
};
