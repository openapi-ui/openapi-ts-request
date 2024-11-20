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
import { minimatch } from 'minimatch';

// 定义模式数组和单个路径
const patterns = ['/sys-a', '/user-z', ''];
const path = '/sys-a';

// 对每个模式进行匹配
patterns.forEach((pattern) => {
  if (minimatch(path, pattern)) {
    console.log(`'${path}' matches pattern '${pattern}'`);
  } else {
    console.log(`'${path}' does not match pattern '${pattern}'`);
  }
});

console.log(minimatch('/user-z/z1', '/user**/*'));
