## 1. 已有 Swagger/Openapi 接口文档，生成请求client(默认是: axios, 除开演示场景，都需要自行封装 request 函数)

在前端项目根目录新建 `openapi-ts-request.config.ts` 文件，然后加入以下代码：

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'https://petstore3.swagger.io/api/v3/openapi.json',
  },
] as GenerateServiceProps[];
```

在 `package.json` 文件的 `script` 中添加命令: `"openapi": "openapi-ts"`

生成结果：

```bash
npm run openapi
```

## 2. 通过 npx 快速查看生成产物

```bash
# npm
npx --package=openapi-ts-request -- openapi -i ./openapi.json -o ./apis --isGenReactQuery=true
npx --package=openapi-ts-request -- openapi -i https://petstore3.swagger.io/api/v3/openapi.json -o ./apis --isGenReactQuery=true

# pnpm
pnpm --package=openapi-ts-request@latest dlx openapi -i ./openapi.json -o ./apis --isGenReactQuery=true
pnpm --package=openapi-ts-request@latest dlx openapi -i https://petstore3.swagger.io/api/v3/openapi.json -o ./apis --isGenReactQuery=true
```

## 3. 自定义请求 request 函数

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'https://petstore3.swagger.io/api/v3/openapi.json',
    requestLibPath: '@/core/request/index.ts',
  },
] as GenerateServiceProps[];
```

在 `package.json` 文件的 `script` 中添加命令: `"openapi": "openapi-ts"`

生成结果：

```bash
npm run openapi
```

### 3.1. 基于 axios 封装 request 函数，参考代码如下：

```ts
import { notification } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';

import {
  ILoginInfoStorageState,
  defaultLoginInfoStorage,
  loginInfoStorageKey,
} from '@/store';

const BASE_URL = 'https://localhost:port';

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 超时时间120秒
});

instance.interceptors.response.use(
  (response) => {
    // data解构
    if (response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response.status >= 300) {
      notification.error({
        message: error.response.data?.msg,
        duration: 2,
      });
    }
    return Promise.reject(error);
  }
);

instance.interceptors.request.use((config) => {
  const loginInfoStorageStr =
    globalThis.localStorage.getItem(loginInfoStorageKey);
  const loginInfoStorage = loginInfoStorageStr
    ? (JSON.parse(loginInfoStorageStr) as ILoginInfoStorageState)
    : defaultLoginInfoStorage;

  if (loginInfoStorage.state.loginInfo) {
    config.headers.Authorization = loginInfoStorage.state.loginInfo.accessToken;
  }

  return config;
});

const request = async <T = unknown>(
  url: string,
  options: AxiosRequestConfig = {}
) => {
  return await instance.request<T, T>({
    url,
    ...options,
  });
};

export default request;
```

### 3.2. 基于 uniapp 封装 request 函数，参考代码如下：

如果我们想在 uniapp 中使用，那么肯定不能用 axios 客户端, 可以基于 uni.request 封装 request 函数（推荐），参考以下代码：

```ts
export default async function request(url, options: AxiosRequestConfig = {}) {
  return new Promise((resolve, reject) => {
    const {
      method = 'GET',
      headers = {},
      data = {},
      timeout,
      withCredentials,
      ...otherOptions
    } = options;

    uni.request({
      url,
      method,
      header: headers,
      data,
      timeout,
      withCredentials, // 用于跨域请求时是否携带凭证
      ...otherOptions,
      success: (res) => {
        // 构造符合 uniapp 的响应对象
        const response = {
          data: res.data,
          status: res.statusCode,
          statusText: res.errMsg,
          headers: res.header,
          config: options,
          request: res,
        };
        // 根据 HTTP 状态码判断请求是否成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(response);
        } else {
          reject(response);
        }
      },
      fail: (error) => {
        // 构造符合 uniapp 错误格式的对象
        const err = {
          message: error.errMsg || 'Request failed',
          config: options,
          request: error,
        };
        reject(err);
      },
    });
  });
}
```

另外一种方式就是使用 `@uni-helper/axios-adapter` 来将axios请求适配为 `uni.request` 请求，使用方式如下：

1. 下载 `@uni-helper/axios-adapter` npm包
2. 修改 `openapi-ts-request.config.ts` 文件为如下代码

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'https://petstore3.swagger.io/api/v3/openapi.json',
    requestImportStatement: `import request from 'axios';\n
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter';\n
request.defaults.adapter = createUniAppAxiosAdapter();`,
  },
] as GenerateServiceProps[];
```

### 3.3. 基于 taro 封装 request 函数

参考基于 uniapp 封装 request 函数的思路

## 4. 已有 Apifox 接口文档，生成请求client，推荐后端给每个接口都打上 `tags`，不要使用 apifox 的 `API文档目录` 作为 `tags`

1. 打开 Apifox 桌面客户端
2. 选择需要查阅 API 文档的服务，点击进入，获取 `projectId`
3. [获取 apifoxToken](https://docs.apifox.com/doc-5723694)
4. 修改 `openapi-ts-request.config.ts` 文件为下面的代码

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    requestLibPath: '@/core/request/index.ts',
    apifoxConfig: {
      projectId: '1229495',
      apifoxToken: 'xxx-xxx-xxx',
    },
  },
] as GenerateServiceProps[];
```

## 5. 生成 react-query 配置

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'https://petstore3.swagger.io/api/v3/openapi.json',
    requestLibPath: '@/core/request/index.ts',
    isGenReactQuery: true,
  },
] as GenerateServiceProps[];

// get请求使用，findPetsByStatusQueryOptions 方法为自动生成 react-query 函数
export function findPetsByStatusQueryOptions(options: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.findPetsByStatusParams;
  options?: CustomRequestOptions;
}) {
  return queryOptions({
    queryFn: async ({ queryKey }) => {
      return apis.findPetsByStatus(queryKey[1] as typeof options);
    },
    queryKey: ['findPetsByStatus', options],
  });
}

// react-query 默认使用
const {
  data,
  error
  isLoading,
  refetch,
} = useQuery(findPetsByStatusQueryOptions({ params: { status: ['available'] } }))

// react-query 额外配置
const {
  data,
  error
  isLoading,
  refetch,
} = useQuery({
  ...findPetsByStatusQueryOptions({ params: { status: ['available'] } }),
  enabled: !!token,
})

// post, delete, patch请求使用，usePlaceOrderMutation 为自动生成 react-query hook函数
export function usePlaceOrderMutation(options?: {
  onSuccess?: (value?: API.Order) => void;
  onError?: (error?: DefaultError) => void;
}) {
  const { onSuccess, onError } = options || {};

  const response = useMutation({
    mutationFn: apis.placeOrder,
    onSuccess(data: API.Order) {
      onSuccess?.(data);
    },
    onError(error) {
      onError?.(error);
    },
  });

  return response;
}

const { mutate, isPending } = usePlaceOrderMutation({
  onSuccess: (data) => {
    console.log('success data: ', data)
  },
})

// 提交请求
mutate({
  body: {
    status: 'placed',
    complete: true,
  }
})
```

## 6. 生成 JavaScript 配置

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'https://petstore3.swagger.io/api/v3/openapi.json',
    requestLibPath: '@/core/request/index.ts',
    isGenJavaScript: true,
  },
] as GenerateServiceProps[];
```

## 7. 只生成需要的接口

如果你只需要部分接口，可以使用 `includeTags` 参数进行配置，它允许你只生成指定 tags 分组的接口

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'https://petstore3.swagger.io/api/v3/openapi.json',
    requestLibPath: '@/core/request/index.ts',
    includeTags: ['pet'],
  },
] as GenerateServiceProps[];
```

## 8. 访问 openapi.json 需要 token

如果接口配置文件 openapi.json 需要 token 才能访问，可以配置 `authorization` 参数，这样获取 openapi.json 会携带上 `authorization`

```ts
import type { GenerateServiceProps } from 'openapi-ts-request';

export default [
  {
    schemaPath: 'https://petstore3.swagger.io/api/v3/openapi.json',
    requestLibPath: '@/core/request/index.ts',
    authorization: 'secret key',
  },
] as GenerateServiceProps[];
```

## 9. 接口 path 没有声明网关前缀，然而实际访问接口需要拼接上网关前缀

某些场景中，可能接口都进行了划分了网关，比如：有些接口属于网关 `/user`，有些接口是属于网关 `/manage`，有些接口属于网关 `/shop`，它们的 path 在接口配置上看都没有显式声明属于这些网关，而是需要我们自行拼接 path 前缀，需要使用 `apiPrefix` 参数进行配置：

```ts
export default [
  {
    schemaPath: 'http://127.0.0.1:4523/export/openapi/2?version=3.0',
    requestLibPath: '@/core/request/index.ts',
    apiPrefix: '"/user"',
  },
  {
    schemaPath: 'http://127.0.0.1:4523/export/openapi/3?version=3.0',
    requestLibPath: '@/core/request/index.ts',
    apiPrefix: '"/manage"',
  },
  {
    schemaPath: 'http://127.0.0.1:4523/export/openapi/4?version=3.0',
    requestLibPath: '@/core/request/index.ts',
    apiPrefix: '"/mall"',
  },
] as GenerateServiceProps[];
```

## 10. 默认只想生成 TypeScript type，不需要生成客户端请求函数

如果你只需要生成 TypeScript type，则使用 `isOnlyGenTypeScriptType` 参数

```ts
export default [
  {
    schemaPath: 'http://127.0.0.1:4523/export/openapi/2?version=3.0',
    requestLibPath: '@/core/request/index.ts',
    isOnlyGenTypeScriptType: true,
  },
] as GenerateServiceProps[];
```

## 11. 建议

由于 openapi-ts-request 生成的产物都进行了格式化，也不能完全保证其正确性，所以建议 eslint, prettier 都忽略对 openapi-ts-request 生成产物进行校验，这样就算 tsc 检测不通过依然可以正常使用

eslint 使用 `ignorePatterns`, `ignore(eslint v9+)`, `.eslintignore 文件` 进行配置，例如：

```js
// .eslintrc.cjs
{
  ignorePatterns: ['dist', 'node_modules', 'src/apis/**'];
}
```

prettier 使用 `.prettierignore 文件`, `overrides` 进行配置，例如：

```js
// .prettierignore
src/apis/**
```
