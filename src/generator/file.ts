import { format } from '@prettier/sync';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import defaultPrettierOptions from '../../prettier.config.cjs';

export const prettierFile = (content: string): [string, boolean] => {
  let result = content;
  let hasError = false;

  try {
    result = format(content, {
      ...defaultPrettierOptions,
      parser: 'typescript',
      importOrderSeparation: false,
    });
  } catch (error) {
    hasError = true;
  }

  return [result, hasError];
};

function mkdir(dir: string) {
  if (!existsSync(dir)) {
    mkdir(dirname(dir));
    mkdirSync(dir);
  }
}

export function writeFile(
  folderPath: string,
  fileName: string,
  content: string
) {
  const filePath = join(folderPath, fileName);
  mkdir(dirname(filePath));

  const [prettierContent, hasError] = prettierFile(content);
  writeFileSync(filePath, prettierContent, {
    encoding: 'utf8',
  });

  return hasError;
}
