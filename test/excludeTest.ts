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
 * 结果 [*]
 */
const excludeTest1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/excludeTest1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: [],
    allowedPaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-b/**', '/sys-c/**', '/user-x/**', '/user-y/**']
 */
const excludeTest2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/excludeTest2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: [],
    allowedPaths: [],
    excludeTags: ['sys-a', 'user-z'],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/**', '/sys-c/**', '/user-x/**', '/user-z/**']
 */
const excludeTest3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/excludeTest3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: [],
    allowedPaths: [],
    excludeTags: [],
    excludePaths: ['/sys-a/**', '/user-z/**'],
  });

/**
 * 结果 []
 */
const excludeTest4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/excludeTest4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: [],
    allowedPaths: [],
    excludeTags: ['*'],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-c/**', '/user-x/**']
 */
const excludeTest5 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/excludeTest5',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'exclude',
    allowedTags: [],
    allowedPaths: [],
    excludeTags: ['sys-a', 'user-z'],
    excludePaths: ['/sys-b/**', '/user-y/**'],
  });

excludeTest1();
excludeTest2();
excludeTest3();
excludeTest4();
excludeTest5();
