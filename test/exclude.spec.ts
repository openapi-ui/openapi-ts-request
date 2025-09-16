import { describe, expect, it } from 'vitest';

import { generateService } from '../src/index';
import { getSnapshotDir, readGeneratedFiles } from './testUtils';

describe('openAPI.generateService priorityRule=exclude', () => {
  /**
   * 结果 [*]
   */
  it('should empty excludeTags and excludePaths return all', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/exclude/test1')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**']
   */
  it('should only excludeTags set works', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/exclude/test2')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**']
   */
  it('should only excludePaths set works', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/exclude/test3')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 []
   */
  it('should excludeTags set works to exclude all', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/exclude/test4')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-c/**', '/user-x/**']
   */
  it('should excludeTags and excludePaths both set works', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/exclude/test5')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/**', '/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**']
   */
  it('should excludeTags case sensitive by default', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/exclude/test6',
      requestLibPath: '../request',
      priorityRule: 'exclude',
      enableLogging: true, // 开启日志
      excludeTags: ['sys-A', 'user-z'],
    });

    await expect(
      readGeneratedFiles('./apis/exclude/test6')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**']
   */
  it('should excludeTags can be case insensitive', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/exclude/test7',
      requestLibPath: '../request',
      priorityRule: 'exclude',
      filterCaseInsensitive: true,
      excludeTags: ['sys-A', 'user-z'],
    });

    await expect(
      readGeneratedFiles('./apis/exclude/test7')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/**', '/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**', '/user-z/**']
   */
  it('should excludePaths case sensitive by default', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/exclude/test8',
      requestLibPath: '../request',
      enableLogging: true, // 开启日志
      priorityRule: 'exclude',
      excludePaths: ['/sys-A/a1/aa1/**'],
    });

    await expect(
      readGeneratedFiles('./apis/exclude/test8')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**', '/user-z/**']
   */
  it('should excludePaths can be case insensitive', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/exclude/test9',
      requestLibPath: '../request',
      filterCaseInsensitive: true,
      priorityRule: 'exclude',
      excludePaths: ['/sys-a/a1/aa1/**'],
    });

    await expect(
      readGeneratedFiles('./apis/exclude/test9')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });
});
