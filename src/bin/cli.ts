#!/usr/bin/env node
import chalk from 'chalk';
import { program } from 'commander';
import { cosmiconfigSync } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';

import { GenerateServiceProps, generateService } from '../index';

program
  .option('-u, --unique-key <uniqueKey>', '唯一标识 uniqueKey')
  .option('-f, --file <filePath>', '文件路径 filePath');
program.parse();
const options = program.opts();

let filePath: string = options.file as string;
if (!filePath) {
  filePath = 'openapi-ts-request';
}
const explorerSync = cosmiconfigSync(
  filePath.replace('.config', '').replace('.ts', ''),
  {
    loaders: {
      '.ts': TypeScriptLoader(),
    },
  }
);

const config = explorerSync.search()?.config as
  | GenerateServiceProps
  | GenerateServiceProps[];

async function run() {
  try {
    const tasks = [];
    if (config) {
      let configs: GenerateServiceProps[] = Array.isArray(config)
        ? config
        : [config];
      if (options.uniqueKey) {
        configs = configs.filter(
          (config) => config.uniqueKey === options.uniqueKey
        );
      }
      for (const config of configs) {
        // await generateService(config);
        tasks.push(generateService(config));
      }
      const results = await Promise.allSettled(tasks);
      const errors: PromiseRejectedResult[] = results.filter(
        (result) => result.status === 'rejected'
      );
      let errorMsg = '';
      for (let i = 0; i < errors.length; i++) {
        const error = errors[i];
        const cnf = configs[i];
        errorMsg += `${cnf.uniqueKey}${cnf.uniqueKey && ':'}${error.reason}\n`;
      }
      if (errorMsg) {
        throw new Error(errorMsg);
      }
    } else {
      throw new Error('config is not found');
    }
  } catch (error) {
    console.log(chalk.red(error));
  }
}

void run();
