import { generateService } from '../src/index';

/**
 * 结果 []
 */
const bothTest1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: [],
    includePaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 [*]
 */
const bothTest2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: [/.*/g],
    includePaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/a1']
 */
const bothTest3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: [/.*/g],
    includePaths: ['/sys-a/**'],
    excludeTags: [],
    excludePaths: ['/sys-a/a1/**'],
  });

/**
 * 结果 ['/user-z/z1']
 */
const bothTest4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: [/.*/g],
    includePaths: ['/sys-a/**', '/user-z/**'],
    excludeTags: ['sys-a'],
    excludePaths: ['/user-z/z1/**'],
  });

/**
 * 结果 ['/user-z/z1', '/user-z/z1/zz1']
 */
const bothTest5 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test5',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: [/.*/g],
    includePaths: [],
    excludeTags: ['sys-b', 'sys-c', 'user-x', 'user-y'],
    excludePaths: ['/sys-a/**', '/user-z/z1/zz1/**'],
  });

bothTest1();
bothTest2();
bothTest3();
bothTest4();
bothTest5();
