import { cosmiconfigSync } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';

import type { ReadConfigOptions } from './type';

export const readConfig = async <T = unknown>({
  fileName,
  filePath,
  fallbackName,
}: ReadConfigOptions): Promise<T | undefined> => {
  try {
    let _fileName_: string | undefined = fileName;

    if (!_fileName_ && !filePath) {
      _fileName_ = fallbackName;
    }

    const explorerSync = cosmiconfigSync(_fileName_ || fallbackName, {
      loaders: {
        '.ts': TypeScriptLoader(),
      },
    });

    if (!_fileName_) {
      return (await explorerSync.load(filePath)?.config) as T;
    } else {
      return (await explorerSync.search()?.config) as T;
    }
  } catch (error) {
    return undefined;
  }
};
