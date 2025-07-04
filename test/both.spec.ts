import { describe, expect, it } from 'vitest';

import { generateService } from '../src/index';
import { getSnapshotDir, readGeneratedFiles } from './testUtils';

describe('openAPI.generateService priorityRule=both', () => {
  /**
   * 结果 []
   */
  it('should empty excludeTags and excludePaths return none', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/both/test1')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 [*]
   */
  it('should return all while includeTags match all', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/both/test2')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/sys-a/a1']
   */
  it('should exclude items from includePaths and includeTags', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/both/test3')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/user-z/z1']
   */
  it('should both excludeTags and excludePaths works with includeTags', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/both/test4')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  /**
   * 结果 ['/user-z/z1', '/user-z/z1/zz1']
   */
  it('should both excludeTags and excludePaths works while excludePaths has wildcard', async (ctx) => {
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
    await expect(
      readGeneratedFiles('./apis/both/test5')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });
});
