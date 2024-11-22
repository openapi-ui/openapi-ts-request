#!/usr/bin/env node
import { program } from 'commander';
import { join } from 'path';

import * as pkg from '../../package.json';
import { generateService } from '../index';

const params = program
  .name('openapi')
  .usage('[options]')
  .version(pkg.version)
  .requiredOption(
    '-i, --input <string>',
    'OpenAPI specification, can be a path, url (required)'
  )
  .requiredOption('-o, --output <string>', 'output directory (required)')
  .option(
    '--requestLibPath <string>',
    'custom request lib path, for example: "@/request", "node-fetch", default is "axios"'
  )
  .option('--includeTags <string[]>', 'generate results from include tags')
  .option(
    '--requestOptionsType <string>',
    'custom request method options parameter type (default: "{ [key: string]: unknown }")'
  )
  .option(
    '--requestImportStatement <string>',
    `custom request import statement, for example: "const request = require('@/request')"`
  )
  .option(
    '--apiPrefix <string>',
    `custom the prefix of the api path, for example: "api"(variable), "'api'"(string)`
  )
  .option(
    '--isDisplayTypeLabel <boolean>',
    'generate label matching type field',
    false
  )
  .option('--isGenJsonSchemas <boolean>', 'generate JSON Schemas', false)
  .option('--mockFolder <string>', 'mock file path')
  .option('--authorization <string>', 'docs authorization')
  .option('--nullable <boolean>', 'null instead of optional', false)
  .option(
    '--isTranslateToEnglishTag <boolean>',
    'translate chinese tag name to english tag name',
    false
  )
  .option(
    '--isOnlyGenTypeScriptType <boolean>',
    'only generate typescript type',
    false
  )
  .option(
    '--isCamelCase <boolean>',
    'camelCase naming of controller files and request client',
    true
  )
  .parse(process.argv)
  .opts();

function getPath(path: string) {
  const isUrl = path.startsWith('http');

  if (isUrl) {
    return path;
  }

  return join(process.cwd(), path);
}

async function run() {
  try {
    const input = getPath(params.input as string);
    const output = getPath(params.output as string);

    await generateService({
      schemaPath: input,
      serversPath: output,
      requestLibPath: params.requestLibPath as string,
      includeTags: params.includeTags as string[],
      requestOptionsType: params.requestOptionsType as string,
      apiPrefix: params.apiPrefix as string,
      isDisplayTypeLabel:
        JSON.parse(params.isDisplayTypeLabel as string) === true,
      isGenJsonSchemas: JSON.parse(params.isGenJsonSchemas as string) === true,
      mockFolder: params.mockFolder as string,
      authorization: params.authorization as string,
      nullable: JSON.parse(params.nullable as string) === true,
      isTranslateToEnglishTag:
        JSON.parse(params.isTranslateToEnglishTag as string) === true,
      isOnlyGenTypeScriptType:
        JSON.parse(params.isOnlyGenTypeScriptType as string) === true,
      isCamelCase: JSON.parse(params.isCamelCase as string) === true,
    });
    process.exit(0);
  } catch (error) {
    console.error('this is error: ', error);
    process.exit(1);
  }
}

void run();
