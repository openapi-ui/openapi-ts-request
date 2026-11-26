import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { escapeJsDoc } from '../src/generator/util';
import * as openAPI from '../src/index';
import { getSnapshotDir, readGeneratedFiles } from './testUtils';

describe('escapeJsDoc', () => {
  it('转义 */', () => {
    expect(escapeJsDoc('*/')).toBe('*\\/');
    expect(escapeJsDoc('Accepts */* or image/*')).toBe(
      'Accepts *\\/* or image/*'
    );
    expect(escapeJsDoc('src/**/*')).toBe('src/**\\/*');
    expect(escapeJsDoc('a */ b */ c')).toBe('a *\\/ b *\\/ c');
  });

  it('不影响不含 */ 的文本', () => {
    expect(escapeJsDoc('')).toBe('');
    expect(escapeJsDoc('a * b / c')).toBe('a * b / c');
    expect(escapeJsDoc('/* foo')).toBe('/* foo');
    expect(escapeJsDoc('\n * line\n')).toBe('\n * line\n');
  });

  it('幂等', () => {
    const once = escapeJsDoc('*/*');
    expect(escapeJsDoc(once)).toBe(once);
  });
});

describe('generateService: description 含 */', () => {
  const schemaPath = join(
    import.meta.dirname,
    './example-files/openapi-jsdoc-escape.json'
  );

  it('测试 description 含 */ 时转义注释', async (ctx) => {
    await openAPI.generateService({
      schemaPath,
      serversPath: './apis/jsdoc-escape',
    });
    await expect(
      readGeneratedFiles('./apis/jsdoc-escape')
    ).resolves.toMatchFileSnapshot(getSnapshotDir(ctx));
  });

  it('生成的 TS 代码没有语法错误', async () => {
    await openAPI.generateService({
      schemaPath,
      serversPath: './apis/jsdoc-escape-compile',
      isGenReactQuery: true,
    });
    const dir = './apis/jsdoc-escape-compile';
    const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const code = readFileSync(join(dir, file), 'utf-8');
      const result = ts.transpileModule(code, {
        fileName: file,
        reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ESNext },
      });
      expect(
        result.diagnostics?.map((d) =>
          ts.flattenDiagnosticMessageText(d.messageText, '\n')
        ),
        file
      ).toEqual([]);
    }
  });
});
