#!/usr/bin/env node
import { cancel, intro, isCancel, multiselect, outro } from '@clack/prompts';
import { program } from 'commander';

import type { GenerateServiceProps } from '../index';
import { generateService } from '../index';
import { logError } from '../log';
import { readConfig } from '../readConfig';

program
  .option('-cfn, --configFileName <string>', 'config file name')
  .option('-cfp, --configFilePath <string>', 'config file path')
  .option('-u, --uniqueKey <string>', 'unique key');

program.parse();
const options = program.opts();

/**
 * 1. 执行 cli 命令读取配置文件，已经使用 openapi.ts 替代了 cli.ts，后期会废弃 cli.ts
 * 2. 如果配置文件中有 uniqueKey，则根据 uniqueKey 生成 service
 * 3. 如果配置文件中没有 uniqueKey，且有多个 service，则交互式选择要生成的 service
 */
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
      let errorMsg = '';

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') {
          const cnf = configs[i];
          errorMsg += `${cnf.uniqueKey}${cnf.uniqueKey && ':'}${result.reason}\n`;
        }
      }

      if (errorMsg) {
        throw new Error(errorMsg);
      }

      if (isInteractive && !errorMsg) {
        outro('🎉 All done!');
      }
    } else {
      throw new Error('config is not found');
    }
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

void run();
