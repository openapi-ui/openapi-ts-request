import { describe, expect, it } from 'vitest';

import { generateService } from '../src/index';
import { getSnapshotDir, readGeneratedFiles } from './testUtils';

describe('openAPI.generateService priorityRule=include', () => {
  /**
   * 结果 [*]
   */
  it('should include all while no include and exclude set', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test1',
      requestLibPath: '../request',
      enableLogging: true, // 开启日志
    });
    await expect(
      readGeneratedFiles('./apis/include/test1')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 []
   */
  it('should return empty while include tags is empty', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test2',
      requestLibPath: '../request',
      enableLogging: true, // 开启日志
      priorityRule: 'include',
      includeTags: [],
      includePaths: ['/sys-a/**', '/sys-b/**', '/sys-c/**'],
    });
    await expect(
      readGeneratedFiles('./apis/include/test2')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 [*]
   */
  it('should include all tags', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test3',
      requestLibPath: '../request',
      enableLogging: true, // 开启日志
      priorityRule: 'include',
      includeTags: [/.*/g],
      includePaths: [],
    });
    await expect(
      readGeneratedFiles('./apis/include/test3')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/**','/sys-b/**','/sys-c/**']
   */
  it('should only include the specified paths and includeTags', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test4',
      requestLibPath: '../request',
      enableLogging: true, // 开启日志
      priorityRule: 'include',
      includeTags: [/.*/g],
      includePaths: ['/sys-a/**', '/sys-b/**', '/sys-c/**'],
    });
    await expect(
      readGeneratedFiles('./apis/include/test4')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/a1/aa1/aaa1','/sys-a/a1/aa1/aaa1/aaaa1']
   */
  it('should excludePaths and excludePaths both specified', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/include/test5')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/**','/user-z/**']
   */
  it('should includeTags specified and includePaths are wildcard', async (ctx) => {
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

    await expect(
      readGeneratedFiles('./apis/include/test6')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/user-z/**']
   */
  it('should includeTags case sensitive by default', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test7',
      requestLibPath: '../request',
      enableLogging: true, // 开启日志
      priorityRule: 'include',
      includeTags: ['sys-A', 'user-z'],
    });

    await expect(
      readGeneratedFiles('./apis/include/test7')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/**', '/user-z/**']
   */
  it('should includeTags can be case insensitive', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test8',
      requestLibPath: '../request',
      filterCaseInsensitive: true,
      includeTags: ['sys-A', 'user-z'],
    });

    await expect(
      readGeneratedFiles('./apis/include/test8')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 []
   */
  it('should includePaths case sensitive by default', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test9',
      requestLibPath: '../request',
      enableLogging: true, // 开启日志
      priorityRule: 'include',
      includePaths: ['/sys-A/a1/aa1/**'],
    });

    await expect(
      readGeneratedFiles('./apis/include/test9')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/a1/aa1/**',]
   */
  it('should includePaths can be case insensitive', async (ctx) => {
    await generateService({
      schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
      serversPath: './apis/include/test10',
      requestLibPath: '../request',
      filterCaseInsensitive: true,
      includePaths: ['/sys-a/a1/aa1/**'],
    });

    await expect(
      readGeneratedFiles('./apis/include/test10')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });
});
