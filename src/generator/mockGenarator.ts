import fs from 'fs';
import type { Dictionary } from 'lodash';
import { forEach, includes, isUndefined, keys } from 'lodash';
import Mock from 'mockjs';
import { dirname, join } from 'path';
import pinyin from 'tiny-pinyin';

import log from '../log';
import OpenAPIParserMock from '../parser-mock/index';
import { getRandomInt } from '../parser-mock/util';
import type {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  ReferenceObject,
  ResponseObject,
} from '../type';
import { methods } from './config';
import { prettierFile, writeFile } from './file';

Mock.Random.extend({
  country() {
    const data = [
      '阿根廷',
      '澳大利亚',
      '巴西',
      '加拿大',
      '中国',
      '法国',
      '德国',
      '印度',
      '印度尼西亚',
      '意大利',
      '日本',
      '韩国',
      '墨西哥',
      '俄罗斯',
      '沙特阿拉伯',
      '南非',
      '土耳其',
      '英国',
      '美国',
    ];

    return data[getRandomInt(0, data.length)];
  },
  phone() {
    const phonepreFix = ['111', '112', '114', '136', '170', '180', '183'];

    return (
      phonepreFix[getRandomInt(0, phonepreFix.length)] + Mock.mock(/\d{8}/)
    );
  },
  status() {
    const status = ['success', 'error', 'default', 'processing', 'warning'];

    return status[getRandomInt(0, status.length)];
  },
  authority() {
    const authority = ['admin', 'user', 'guest'];

    return authority[getRandomInt(0, authority.length)];
  },
  avatar() {
    const avatar = [
      'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
      'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
      'https://avatars0.githubusercontent.com/u/507615?s=40&v=4',
      'https://avatars1.githubusercontent.com/u/8186664?s=40&v=4',
    ];

    return avatar[getRandomInt(0, avatar.length)];
  },
  group() {
    const data = [
      '体验技术部',
      '创新科技组',
      '前端 6 组',
      '区块链平台部',
      '服务技术部',
    ];

    return data[getRandomInt(0, data.length)];
  },
  label() {
    const label = [
      '很有想法的',
      '小清新',
      '傻白甜',
      '阳光少年',
      '大咖',
      '健身达人',
      '程序员',
      '算法工程师',
      '川妹子',
      '名望程序员',
      '大长腿',
      '海纳百川',
      '专注设计',
      '爱好广泛',
      'IT 互联网',
    ];

    return label[getRandomInt(0, label.length)];
  },
  href() {
    const href = [
      'https://preview.pro.ant.design/dashboard/analysis',
      'https://ant.design',
      'https://procomponents.ant.design/',
      'https://umijs.org/',
      'https://github.com/umijs/dumi',
    ];

    return href[getRandomInt(0, href.length)];
  },
});

const genMockData = (example: unknown): unknown => {
  if (!example) {
    return {};
  }

  if (typeof example === 'string') {
    return Mock.mock(example);
  }

  if (Array.isArray(example)) {
    return Mock.mock(example);
  }

  return Object.keys(example)
    .map((name) => {
      return {
        [name]: Mock.mock(example[name]) as unknown,
      };
    })
    .reduce((pre, next) => {
      return {
        ...pre,
        ...next,
      };
    }, {});
};

const genByTemp = ({
  method,
  path,
  parameters,
  status,
  data,
}: {
  method: string;
  path: string;
  parameters: (ReferenceObject | ParameterObject)[];
  status: string;
  data: string;
}) => {
  if (!includes(methods, method.toLocaleLowerCase())) {
    return '';
  }

  let securityPath = path;
  forEach(parameters, (item: ParameterObject) => {
    if (item.in === 'path') {
      securityPath = securityPath.replace(`{${item.name}}`, `:${item.name}`);
    }
  });

  return `'${method.toUpperCase()} ${securityPath}': (req: Request, res: Response) => {
    res.status(${status}).send(${data});
  }`;
};

const genMockFiles = (mockFunction: string[]) => {
  return prettierFile(`
/* eslint-disable */
// @ts-ignore
import { Request, Response } from 'express';

export default {
${mockFunction.join('\n,')}
    }`)[0];
};

export type genMockDataServerConfig = {
  openAPI: OpenAPIObject;
  mockFolder: string;
};

export const mockGenerator = ({
  openAPI,
  mockFolder,
}: genMockDataServerConfig) => {
  const openAPIParse = new OpenAPIParserMock(openAPI);
  const docs = openAPIParse.parser();
  const pathList = keys(docs.paths);
  const { paths } = docs;
  const mockActionsObj = {} as Dictionary<string[]>;

  pathList.forEach((path) => {
    const pathConfig = paths[path];
    keys(pathConfig).forEach((method) => {
      const methodConfig = pathConfig[method] as OperationObject;

      if (methodConfig) {
        let conte = (
          methodConfig.operationId ||
          methodConfig?.tags?.join('/') ||
          path.replace('/', '').split('/')[1]
        )?.replace(/[^\w^\s^\u4e00-\u9fa5]/gi, '');

        if (/[\u3220-\uFA29]/.test(conte)) {
          conte = pinyin.convertToPinyin(conte, '', true);
        }

        if (!conte) {
          return;
        }

        const response = methodConfig.responses?.['200'] as ResponseObject;
        const data = genMockData(response?.example);

        if (!mockActionsObj[conte]) {
          mockActionsObj[conte] = [];
        }

        const tempFile = genByTemp({
          method,
          path,
          parameters: methodConfig.parameters,
          status: '200',
          data: JSON.stringify(data),
        });

        if (tempFile) {
          mockActionsObj[conte].push(tempFile);
        }
      }
    });
  });

  Object.keys(mockActionsObj).forEach((file) => {
    if (!file || isUndefined(file)) {
      return;
    }

    if (file.includes('/')) {
      const dirName = dirname(join(mockFolder, `${file}.mock.ts`));

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }
    }
    writeFile(
      mockFolder,
      `${file}.mock.ts`,
      genMockFiles(mockActionsObj[file])
    );
  });

  log('✅ 生成 mock 文件成功');
};
