#!/usr/bin/env node
import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';

import { GenerateServiceProps, generateService } from '../index';

const explorerSync = cosmiconfigSync('openapi-ts-request');
const config = explorerSync.search()?.config as
  | GenerateServiceProps
  | GenerateServiceProps[];

async function run() {
  try {
    if (config) {
      const configs: GenerateServiceProps[] = Array.isArray(config)
        ? config
        : [config];

      for (const config of configs) {
        await generateService(config);
      }
    } else {
      throw new Error('config is not found');
    }
  } catch (error) {
    console.log(chalk.red(error));
  }
}

void run();
