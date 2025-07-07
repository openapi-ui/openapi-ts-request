import { sortBy } from 'lodash';
import fs, { readFile } from 'node:fs/promises';
import path from 'node:path';
import sanitizeFilename from 'sanitize-filename';
import { TestContext } from 'vitest';

export async function readGeneratedFiles(dir: string) {
  const direntArray = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true,
  });

  const orderedFiles = sortBy(
    direntArray
      .filter((f) => f.isFile())
      .map((a) => path.join(a.parentPath, a.name))
  );

  let finalContent = '';
  for (const file of orderedFiles) {
    const singleFileContent = await readFile(file, 'utf-8');
    finalContent += singleFileContent;
  }

  return finalContent;
}

export function getSnapshotDir(ctx: TestContext) {
  const snapFileName = sanitizeFilename(`${ctx.task.name}.snap`, {
    replacement: '_',
  });
  return `./__snapshots__/${path.basename(ctx.task.file.name).replace('.spec.ts', '')}/${snapFileName}`;
}
