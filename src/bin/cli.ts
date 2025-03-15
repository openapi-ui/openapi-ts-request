#!/usr/bin/env node
import chalk from 'chalk';
import { program } from 'commander';

import { GenerateServiceProps, generateService } from '../index';
import { readConfig } from '../readConfig';

program
  .option('-u, --unique-key <uniqueKey>', '唯一标识 uniqueKey')
  .option('-fn, --fileName <fileName>', '文件名 fileName')
  .option('-fp, --filePath <filePath>', '文件路径 filePath');

program.parse();
const options = program.opts();

async function run() {
  const config = await readConfig<
    GenerateServiceProps | GenerateServiceProps[]
  >({
    fallbackName: 'openapi-ts-request',
    filePath: options.filePath as string,
    fileName: options.fileName as undefined,
  });

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
