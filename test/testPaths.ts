import { GenerateServiceProps, generateService } from '../src/index';

/**
 * 测试allowedPaths
 */
const testAllowedPaths1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedPaths1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['*'],
    allowedPaths: ['/sys-a/*', '/sys-b/*', '/sys-c/*'],
    // allowedPaths: [/\/sys-a\//]
  });

const testAllowedPaths2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedPaths2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['*'],
    allowedPaths: [],
    excludePaths: ['/user-x', '/user-y', '/user-z'],
  });

const testAllowedPaths3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedPaths3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['*'],
    allowedPaths: [],
    excludePaths: [],
  });

const testAllowedPaths4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testAllowedPaths4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['*'],
    allowedPaths: ['/sys-a/**'],
  });

const testExcludePaths1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testExcludePaths1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    allowedTags: ['*'],
    priorityRule: 'exclude',
    excludePaths: ['/sys-a/**', '/user-z/**'],
  });

const testExcludePaths2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testExcludePaths2',
    requestLibPath: '../request',
    allowedTags: ['*'],
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedPaths: ['sys-a', 'user-z'],
    excludePaths: [],
  });

const testIncludePaths1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludePaths1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['*'],
    allowedPaths: ['/sys-a/*', '/user-z/*'],
    excludePaths: ['/sys-c/*', '/user-z/*'],
  });

const testIncludePaths2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludePaths2',
    requestLibPath: '../request',
    allowedTags: ['*'],
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedPaths: ['/user-x/**'],
    excludePaths: ['/user/'],
  });

const testIncludePaths3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludePaths3',
    requestLibPath: '../request',

    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedPaths: ['sys-*', 'user-*'],
    excludePaths: ['*'],
  });

const testIncludePaths4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/testIncludePaths4',
    requestLibPath: '../request',

    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedPaths: ['*'],
    excludePaths: [],
  });

// ==========AllowedPaths==============
testAllowedPaths1();
testAllowedPaths2();
testAllowedPaths3();
testAllowedPaths4();

// ==========ExcludePaths==============
// testExcludePaths1()
// testExcludePaths2()

// ==========IncludePaths==============
// testIncludePaths1()
// testIncludePaths2()
// testIncludePaths3()
// testIncludePaths4()
