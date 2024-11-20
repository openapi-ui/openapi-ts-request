import { GenerateServiceProps, generateService } from '../src/index';

/**
 * 测试allowedTags
 */
const testAllowedTags1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedTags1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['sys-a', 'sys-b', 'sys-c'],
  });

const testAllowedTags2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedTags2',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: [],
    excludeTags: ['user-x', 'user-y', 'user-z'],
  });

const testAllowedTags3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedTags3',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: [],
    excludeTags: [],
  });

const testAllowedTags4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedTags4',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['user-*'],
    excludeTags: [],
  });

const testExcludeTags1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testExcludeTags1',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: ['sys-a'],
    excludeTags: ['sys-a', 'user-z'],
  });

const testExcludeTags2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testExcludeTags2',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: ['sys-a', 'user-z'],
    excludeTags: [],
  });

const testExcludeTags3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testExcludeTags3',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: ['sys-a', 'user-z'],
    excludeTags: ['sys-*', 'user-*'],
  });

const testExcludeTags4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testExcludeTags4',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: [],
    excludeTags: [],
  });

const testIncludeTags1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludeTags1',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['sys-a', 'sys-b', 'sys-c', 'user-z'],
    excludeTags: ['sys-c', 'user-z'],
  });

const testIncludeTags2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludeTags2',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['sys-*'],
    excludeTags: ['sys-a', 'sys-b', 'user-x'],
  });

const testIncludeTags3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludeTags3',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['sys-*', 'user-*'],
    excludeTags: ['*'],
  });

const testIncludeTags4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludeTags4',
    requestLibPath: '../request',
    apiPrefix: '`/consumer-api`',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['*'],
    excludeTags: [],
  });

// ==========AllowedTags==============
testAllowedTags1();
testAllowedTags2();
testAllowedTags3();
testAllowedTags4();

// ==========ExcludeTags==============
testExcludeTags1();
testExcludeTags2();
testExcludeTags3();
testExcludeTags4();

// ==========IncludeTags==============
testIncludeTags1();
testIncludeTags2();
testIncludeTags3();
testIncludeTags4();
