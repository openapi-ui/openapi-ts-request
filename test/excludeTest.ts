import { generateService } from '../src/index';

/**
 * 结果 [*]
 */
const excludeTest1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/exclude/test1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    includeTags: [],
    includePaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**']
 */
const excludeTest2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/exclude/test2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    includeTags: [],
    includePaths: [],
    excludeTags: ['sys-a', 'user-z'],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/**', '/sys-c/**', '/user-x/**', '/user-z/**']
 */
const excludeTest3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/exclude/test3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    includeTags: [],
    includePaths: [],
    excludeTags: [],
    excludePaths: ['/sys-a/**', '/user-z/**'],
  });

/**
 * 结果 []
 */
const excludeTest4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/exclude/test4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    includeTags: [],
    includePaths: [],
    excludeTags: [/.*/g],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-c/**', '/user-x/**']
 */
const excludeTest5 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/exclude/test5',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    includeTags: [],
    includePaths: [],
    excludeTags: ['sys-a', 'user-z'],
    excludePaths: ['/sys-b/**', '/user-y/**'],
  });

excludeTest1();
excludeTest2();
excludeTest3();
excludeTest4();
excludeTest5();
