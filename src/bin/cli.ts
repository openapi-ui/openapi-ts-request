#!/usr/bin/env node
import { cancel, intro, isCancel, multiselect, outro } from '@clack/prompts';
import chalk from 'chalk';
import { program } from 'commander';

import type { GenerateServiceProps } from '../index';
import { generateService } from '../index';
import { readConfig } from '../readConfig';

program
  .option('-cfn, --configFileName <string>', 'config file name')
  .option('-cfp, --configFilePath <string>', 'config file path')
  .option('-u, --uniqueKey <string>', 'unique key');

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

      /** 是否交互式 */
      let isInteractive = false;

      if (options.uniqueKey) {
        configs = configs.filter(
          (config) => config.uniqueKey === options.uniqueKey
        );
      } else if (configs.length > 1) {
        // 如果没有指定 uniqueKey，并且有多个配置，则交互式选择
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

      if (isInteractive && !errors.length) {
        outro('🎉 All done!');
      }
    } else {
      throw new Error('config is not found');
    }
  } catch (error) {
    console.log(chalk.red(error));
  }
}

void run();
