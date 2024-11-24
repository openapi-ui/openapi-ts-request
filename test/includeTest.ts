import { generateService } from '../src/index';

/**
 * 结果 [*]
 */
const includeTest1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/include/test1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
  });

/**
 * 结果 []
 */
const includeTest2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/include/test2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    includeTags: [],
    includePaths: ['/sys-a/**', '/sys-b/**', '/sys-c/**'],
  });

/**
 * 结果 ['/sys-a/**','/sys-b/**','/sys-c/**']
 */
const includeTest3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/include/test3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    includeTags: [/.*/g],
    includePaths: [],
  });

/**
 * 结果 ['/sys-a/**','/sys-b/**','/sys-c/**']
 */
const includeTest4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/include/test4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    includeTags: [/.*/g],
    includePaths: ['/sys-a/**', '/sys-b/**', '/sys-c/**'],
  });

/**
 * 结果 ['/sys-a/a1/aa1/aaa1','/sys-a/a1/aa1/aaa1/aaaa1']
 */
const includeTest5 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/include/test5',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    includeTags: ['sys-a'],
    includePaths: ['/sys-a/a1/aa1/**'],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/**','/user-z/**']
 */
const includeTest6 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/include/test6',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    includeTags: ['sys-a', 'user-z'],
    includePaths: ['/**'],
    excludeTags: [],
    excludePaths: [],
  });

includeTest1();
includeTest2();
includeTest3();
includeTest4();
includeTest5();
includeTest6();
