import { join } from 'path';
import { describe, expect, it } from 'vitest';

import * as openAPI from '../src/index';
import { getSnapshotDir, readGeneratedFiles } from './testUtils';

describe('OpenAPI 3.1 Type Array Support', () => {
  it('测试 OpenAPI 3.1 type 数组格式 (如 ["string", "null"])', async (ctx) => {
    await openAPI.generateService({
      schemaPath: join(import.meta.dirname, './openapi-3.1-type-array.json'),
      serversPath: './apis/openapi-3.1-type-array',
      isDisplayTypeLabel: true,
    });

    await expect(
      readGeneratedFiles('./apis/openapi-3.1-type-array')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });
});
