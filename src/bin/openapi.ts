#!/usr/bin/env node
import { cancel, intro, isCancel, multiselect, outro } from '@clack/prompts';
import { type OptionValues, program } from 'commander';
import { pickBy } from 'lodash';
import { join } from 'path';

import * as pkg from '../../package.json';
import type { GenerateServiceProps } from '../index';
import { generateService } from '../index';
import { logError } from '../log';
import { readConfig } from '../readConfig';
import type { IPriorityRule, IReactQueryMode } from '../type';

const params = program
  .name('openapi')
  .usage('[options]')
  .version(pkg.version)
  .option('-i, --input <string>', 'OpenAPI specification, can be a path, url')
  .option('-o, --output <string>', 'output directory')
  .option('-cfn, --configFileName <string>', 'config file name')
  .option('-cfp, --configFilePath <string>', 'config file path')
  .option(
    '--requestLibPath <string>',
    'custom request lib path, for example: "@/request", "node-fetch" (default: "axios")'
  )
  .option('-f, --full <boolean>', 'full replacement', true)
  .option('--enableLogging <boolean>', 'open the log', false)
  .option(
    '--priorityRule <string>',
    'priority rule, include/exclude/both (default: "include")'
  )
  .option(
    '--filterCaseInsensitive <boolean>',
    'whether to perform a case-insensitive match with includeTags, includePaths, excludeTags, excludePaths filters',
    false
  )
  .option(
    '--includeTags <(string|RegExp)[]>',
    'generate code from include tags'
  )
  .option(
    '--includePaths <(string|RegExp)[]>',
    'generate code from include paths'
  )
  .option(
    '--excludeTags <(string|RegExp)[]>',
    'generate code from exclude tags'
  )
  .option(
    '--excludePaths <(string|RegExp)[]>',
    'generate code from exclude paths'
  )
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
  .option('--isGenReactQuery <boolean>', 'generate react-query', false)
  .option(
    '--reactQueryMode <string>',
    'react-query mode, react/vue (default: "react")'
  )
  .option('--isGenJavaScript <boolean>', 'generate JavaScript', false)
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
  .option(
    '--isSupportParseEnumDesc <boolean>',
    'parse enum description to generate enum label',
    false
  )
  .option(
    '--supportParseEnumDescByReg <string>',
    'custom regex for parsing enum description'
  )
  .option(
    '--splitTypesByModule <boolean>',
    'split types by module, generates {module}.type.ts, common.type.ts, enum.ts, types.ts',
    false
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

const baseGenerate = (_params_: OptionValues): GenerateServiceProps => {
  const input = getPath(_params_.input as string);
  const output = getPath(_params_.output as string);
  const options: GenerateServiceProps = {
    schemaPath: input,
    serversPath: output,
    requestLibPath: _params_.requestLibPath as string,
    full: JSON.parse(_params_.full as string) === true,
    enableLogging: JSON.parse(_params_.enableLogging as string) === true,
    priorityRule: _params_.priorityRule as IPriorityRule,
    filterCaseInsensitive:
      JSON.parse(_params_.filterCaseInsensitive as string) === true,
    includeTags: _params_.includeTags as string[],
    includePaths: _params_.includePaths as string[],
    excludeTags: _params_.excludeTags as string[],
    excludePaths: _params_.excludePaths as string[],
    requestOptionsType: _params_.requestOptionsType as string,
    apiPrefix: _params_.apiPrefix as string,
    isGenReactQuery: JSON.parse(_params_.isGenReactQuery as string) === true,
    reactQueryMode: _params_.reactQueryMode as IReactQueryMode,
    isGenJavaScript: JSON.parse(_params_.isGenJavaScript as string) === true,
    isDisplayTypeLabel:
      JSON.parse(_params_.isDisplayTypeLabel as string) === true,
    isGenJsonSchemas: JSON.parse(_params_.isGenJsonSchemas as string) === true,
    mockFolder: _params_.mockFolder as string,
    authorization: _params_.authorization as string,
    nullable: JSON.parse(_params_.nullable as string) === true,
    isTranslateToEnglishTag:
      JSON.parse(_params_.isTranslateToEnglishTag as string) === true,
    isOnlyGenTypeScriptType:
      JSON.parse(_params_.isOnlyGenTypeScriptType as string) === true,
    isCamelCase: JSON.parse(_params_.isCamelCase as string) === true,
    isSupportParseEnumDesc:
      JSON.parse(_params_.isSupportParseEnumDesc as string) === true,
    supportParseEnumDescByReg: _params_.supportParseEnumDescByReg as
      | string
      | RegExp,
    splitTypesByModule:
      JSON.parse(_params_.splitTypesByModule as string) === true,
  };

  return options;
};

async function run() {
  if (params.input && params.output) {
    const options = baseGenerate(params);
    await generateService(
      pickBy(
        options,
        (value) => value !== null && value !== undefined && value !== ''
      ) as GenerateServiceProps
    );
    process.exit(0);
  }

  const cnf = await readConfig<GenerateServiceProps | GenerateServiceProps[]>({
    fallbackName: 'openapi-ts-request',
    filePath: params.configFilePath as string,
    fileName: params.configFileName as undefined,
  });

  try {
    if (cnf) {
      const tasks = [];
      let configs: GenerateServiceProps[] = Array.isArray(cnf) ? cnf : [cnf];
      /** 是否交互式 */
      let isInteractive = false;

      if (configs.length > 1) {
        // 有多个配置，则交互式选择
        isInteractive = true;

        console.log(''); // 添加一个空行
        intro('🎉 欢迎使用 openapi-ts-request 生成器');
        const selected = await multiselect({
          message: '请选择要生成的 service',
          options: configs.map((config) => ({
            value: config,
            label: config.describe || config.schemaPath,
          })),
        });

        if (isCancel(selected)) {
          cancel('👋 Has cancelled');
          process.exit(0);
        }

        configs = selected;
      }

      for (const config of configs) {
        tasks.push(generateService(config));
      }

      const results = await Promise.allSettled(tasks);
      let errorMsg = '';

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status === 'rejected') {
          const cnf = configs[i];
          const label = cnf.describe || cnf.schemaPath;
          errorMsg += `${label}${label && ':'}${result.reason}\n`;
        }
      }

      if (errorMsg) {
        throw new Error(errorMsg);
      }

      if (isInteractive && !errorMsg) {
        outro('🎉 All done!');
      }
    } else {
      throw new Error(
        'Please provide either input/output options or a configuration file path and name.'
      );
    }
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

void run();
