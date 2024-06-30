import axios from 'axios';
import http from 'http';
import https from 'https';
import { OpenAPI, OpenAPIV2 } from 'openapi-types';
import converter from 'swagger2openapi';

import log from './log';

export const getImportStatement = (requestLibPath: string) => {
  if (requestLibPath) {
    if (requestLibPath.startsWith('import')) {
      return requestLibPath;
    }

    return `import request from '${requestLibPath}';`;
  }

  return `import request from 'axios';`;
};

async function getSchema(schemaPath: string) {
  if (schemaPath.startsWith('http')) {
    const isHttps = schemaPath.startsWith('https:');
    const protocol = isHttps ? https : http;

    try {
      const agent = new protocol.Agent({
        rejectUnauthorized: false,
      });
      const config = isHttps ? { httpsAgent: agent } : { httpAgent: agent };
      const json = await axios
        .get(schemaPath, config)
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

  const schema = (await require(schemaPath)) as OpenAPI.Document;

  return schema;
}

function converterSwaggerToOpenApi(swagger: OpenAPI.Document) {
  if (!(swagger as OpenAPIV2.Document).swagger) {
    return swagger;
  }

  return new Promise((resolve, reject) => {
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

export const getOpenAPIConfig = async (schemaPath: string) => {
  const schema = await getSchema(schemaPath);

  if (!schema) {
    return null;
  }

  const openAPI = await converterSwaggerToOpenApi(schema);

  return openAPI;
};
