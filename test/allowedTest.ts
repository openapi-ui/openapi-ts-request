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
const allowedTest1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/allowedTest1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: [],
    allowedPaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 []
 */
const allowedTest2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/allowedTest2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: [],
    allowedPaths: ['/sys-a/**', '/sys-b/**', '/sys-c/**'],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 [*]
 */
const allowedTest3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/allowedTest3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['*'],
    allowedPaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/**','/sys-b/**','/sys-c/**']
 */
const allowedTest4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/allowedTest4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['*'],
    allowedPaths: ['/sys-a/**', '/sys-b/**', '/sys-c/**'],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/a1/aa1/aaa1','/sys-a/a1/aa1/aaa1/aaaa1']
 */
const allowedTest5 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/allowedTest5',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['sys-a'],
    allowedPaths: ['/sys-a/a1/aa1/**'],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/**','/user-z/**']
 */
const allowedTest6 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/allowedTest6',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'allowed',
    allowedTags: ['sys-a', 'user-z'],
    allowedPaths: ['/**'],
    excludeTags: [],
    excludePaths: [],
  });

allowedTest1();
allowedTest2();
allowedTest3();
allowedTest4();
allowedTest5();
allowedTest6();
