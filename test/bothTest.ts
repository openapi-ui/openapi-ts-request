/**
 * Copyright [2022] [remember5]
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { generateService } from '../src/index';

/**
 * 结果 []
 */
const bothTest1 = async () =>
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

/**
 * 结果 [*]
 */
const bothTest2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: ['*'],
    includePaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/a1']
 */
const bothTest3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: ['*'],
    includePaths: ['/sys-a/**'],
    excludeTags: [],
    excludePaths: ['/sys-a/a1/**'],
  });

/**
 * 结果 ['/user-z/z1']
 */
const bothTest4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: ['*'],
    includePaths: ['/sys-a/**', '/user-z/**'],
    excludeTags: ['sys-a'],
    excludePaths: ['/user-z/z1/**'],
  });

/**
 * 结果 ['/user-z/z1', '/user-z/z1/zz1']
 */
const bothTest5 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/openapi-priority-rule.json`,
    serversPath: './apis/both/test5',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'both',
    includeTags: ['*'],
    includePaths: [],
    excludeTags: ['sys-b', 'sys-c', 'user-x', 'user-y'],
    excludePaths: ['/sys-a/**', '/user-z/z1/zz1/**'],
  });

bothTest1();
bothTest2();
bothTest3();
bothTest4();
bothTest5();
