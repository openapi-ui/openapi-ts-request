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
const includeTest1 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/includeTest1',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: [],
    allowedPaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 [*]
 */
const includeTest2 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/includeTest2',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['*'],
    allowedPaths: [],
    excludeTags: [],
    excludePaths: [],
  });

/**
 * 结果 ['/sys-a/a1']
 */
const includeTest3 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/includeTest3',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['*'],
    allowedPaths: ['/sys-a/**'],
    excludeTags: [],
    excludePaths: ['/sys-a/a1/**'],
  });

/**
 * 结果 ['/user-z/z1']
 */
const includeTest4 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/includeTest4',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['*'],
    allowedPaths: ['/sys-a/**', '/user-z/**'],
    excludeTags: ['sys-a'],
    excludePaths: ['/user-z/z1/**'],
  });

/**
 * 结果 ['/user-z/z1', '/user-z/z1/zz1']
 */
const includeTest5 = async () =>
  await generateService({
    schemaPath: `${__dirname}/example-files/zq.json`,
    serversPath: './apis/includeTest5',
    requestLibPath: '../request',
    enableLogging: true, // 开启日志
    priorityRule: 'include',
    allowedTags: ['*'],
    allowedPaths: [],
    excludeTags: ['sys-b', 'sys-c', 'user-x', 'user-y'],
    excludePaths: ['/sys-a/**', '/user-z/z1/zz1/**'],
  });

includeTest1();
includeTest2();
includeTest3();
includeTest4();
includeTest5();
