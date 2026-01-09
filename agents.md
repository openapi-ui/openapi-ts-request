# OpenAPI TypeScript Request - AI Agent Guide

## 🤖 Tool Overview

OpenAPI TypeScript Request is a powerful code generator that converts Swagger2/OpenAPI3/Apifox specifications into TypeScript/JavaScript client code with advanced features like React Query integration, mock services, type labels, and multi-client support.

**Core Capabilities:**

- Generate TypeScript/JavaScript request functions from OpenAPI specs
- Support multiple HTTP clients (axios, fetch, uniapp, taro, node-fetch)
- Generate React Query / Vue Query hooks
- Create mock services with realistic data
- Generate Chinese type labels for forms
- Support enum descriptions and translations
- Generate JSON Schemas for validation

## 🎯 Quick AI Decision Tree

### 1. Project Type Detection

```typescript
// Detect from package.json dependencies
if (has("react") && has("@tanstack/react-query")) {
  recommend: { isGenReactQuery: true, reactQueryMode: "react" }
}
else if (has("vue") && has("@tanstack/vue-query")) {
  recommend: { isGenReactQuery: true, reactQueryMode: "vue" }
}
else if (has("@tarojs/taro") || has("@dcloudio/uni-app")) {
  recommend: { requestLibPath: "@/request" }
}
else if (isNodeProject) {
  recommend: { requestLibPath: "node-fetch" }
}
```

### 2. Complete Configuration Reference

#### Core Settings

| Configuration | Type | Default | Description | When to Use |
| --- | --- | --- | --- | --- |
| `schemaPath` | string | **required** | OpenAPI/Swagger spec URL or file path | Always required |
| `serversPath` | string | `"./src/apis"` | Output directory for generated files | Custom output location |
| `requestLibPath` | string | `"axios"` | HTTP client library path | Custom request client |
| `full` | boolean | `true` | Full replacement vs incremental | Incremental updates |
| `enableLogging` | boolean | `false` | Enable debug logging | Troubleshooting |

#### Filtering & Tags

| Configuration | Type | Default | Description | When to Use |
| --- | --- | --- | --- | --- |
| `priorityRule` | `"include"\|"exclude"\|"both"` | `"include"` | Filter strategy | Large APIs |
| `filterCaseInsensitive` | boolean | `false` | Case-insensitive tag/path matching | Mixed case APIs |
| `includeTags` | `(string\|RegExp)[]` | - | Only generate these tags | Selective generation |
| `includePaths` | `(string\|RegExp)[]` | - | Only generate these paths | Path-based filtering |
| `excludeTags` | `(string\|RegExp)[]` | - | Skip these tags | Exclude unwanted APIs |
| `excludePaths` | `(string\|RegExp)[]` | - | Skip these paths | Exclude specific endpoints |

#### Code Generation Options

| Configuration | Type | Default | Description | When to Use |
| --- | --- | --- | --- | --- |
| `isGenJavaScript` | boolean | `false` | Generate JS instead of TS | JS-only projects |
| `isGenReactQuery` | boolean | `false` | Generate React/Vue Query hooks | Query-based apps |
| `reactQueryMode` | `"react"\|"vue"` | `"react"` | Query hook framework | Vue projects |
| `isDisplayTypeLabel` | boolean | `false` | Generate Chinese field labels | Form applications |
| `isGenJsonSchemas` | boolean | `false` | Generate JSON Schema validation | Data validation |
| `isOnlyGenTypeScriptType` | boolean | `false` | Only types, no request functions | Type-only needs |
| `isCamelCase` | boolean | `true` | Use camelCase naming | Consistent naming |
| `isSupportParseEnumDesc` | boolean | `false` | Parse enum descriptions | Labeled enums |
| `supportParseEnumDescByReg` | `string \| RegExp` | - | Custom regex for parsing enum descriptions. If set, replaces default parseDescriptionEnum method. Example: `/([^\s=<>/&;]+(?:\s+[^\s=<>/&;]+)*)\s*=\s*(\d+)/g` matches "普通 = 0" or "SampleMaker = 1" | Custom enum description formats |
| `isSplitTypesByModule` | boolean | `false` | Split types by module, generates {module}.type.ts, common.type.ts, enum.ts, types.ts | Large projects with many types |

#### Request Customization

| Configuration | Type | Default | Description | When to Use |
| --- | --- | --- | --- | --- |
| `requestOptionsType` | string | `"{ [key: string]: unknown }"` | Type for request options | Custom options |
| `requestImportStatement` | string | - | Custom import statement | Custom request setup |
| `apiPrefix` | string\|function | - | API path prefix | Namespaced APIs |
| `dataFields` | string[] | - | Response data field path | Nested response data |

#### Internationalization

| Configuration | Type | Default | Description | When to Use |
| --- | --- | --- | --- | --- |
| `isTranslateToEnglishTag` | boolean | `false` | Translate Chinese tags to English | Chinese API docs |
| `nullable` | boolean | `false` | Use null instead of optional | Strict null checks |

#### Development & Testing

| Configuration | Type | Default | Description | When to Use |
| --- | --- | --- | --- | --- |
| `mockFolder` | string | - | Mock data output directory | Development with mocks |
| `authorization` | string | - | API documentation auth token | Protected docs |
| `timeout` | number | `60000` | Request timeout in ms | Slow APIs |

#### Advanced Options

| Configuration | Type | Default | Description | When to Use |
| --- | --- | --- | --- | --- |
| `namespace` | string | `"API"` | TypeScript namespace | Custom namespace |
| `templatesFolder` | string | - | Custom template directory | Custom templates |
| `apifoxConfig` | object | - | Apifox-specific configuration | Apifox integration |
| `describe` | string | - | description information | Using cli interactive operation mode |

### 3. Feature Requirements Mapping

| User Need | Configuration | Additional Notes |
| --- | --- | --- |
| "生成中文字段标签" | `isDisplayTypeLabel: true` | For form field labels |
| "支持小程序开发" | `requestLibPath: "@/request"` | UniApp/Taro support |
| "生成React Hooks" | `isGenReactQuery: true` | Auto-generates query hooks |
| "生成Mock数据" | `mockFolder: "./mocks"` | Uses mockjs for fake data |
| "只要类型定义" | `isOnlyGenTypeScriptType: true` | Skip request functions |
| "增量更新代码" | `full: false` | Preserve manual modifications |
| "过滤大型API" | `includeTags: ["user", "order"]` | Performance optimization |
| "自定义请求客户端" | `requestLibPath: "@/utils/request"` | Custom request setup |
| "支持文件上传" | Check OpenAPI for multipart | Auto-detects file uploads |
| "翻译中文标签" | `isTranslateToEnglishTag: true` | Chinese to English tags |
| "解析枚举描述" | `isSupportParseEnumDesc: true` | Enum with descriptions |
| "自定义枚举解析正则" | `supportParseEnumDescByReg: /pattern/g` | Custom enum description parsing |
| "生成JSON验证" | `isGenJsonSchemas: true` | Schema validation |
| "前缀API路径" | `apiPrefix: "'api'"` | Add prefix to paths |
| "按模块拆分类型" | `isSplitTypesByModule: true` | Large projects, better code organization |

## 📋 Common Configuration Scenarios

### Scenario 1: React + TypeScript Production App

```typescript
{
  schemaPath: "https://api.example.com/openapi.json",
  serversPath: "./src/apis",
  isGenReactQuery: true,
  reactQueryMode: "react",
  isDisplayTypeLabel: true,
  isGenJsonSchemas: true,
  isCamelCase: true,
  requestLibPath: "axios",
  nullable: false,
  enableLogging: false
}
```

### Scenario 2: Vue + TypeScript Project

```typescript
{
  schemaPath: "./openapi.yaml",
  serversPath: "./src/api",
  isGenReactQuery: true,
  reactQueryMode: "vue",
  isDisplayTypeLabel: true,
  isCamelCase: true,
  requestLibPath: "axios",
}
```

### Scenario 3: UniApp/Taro Mini Program

```typescript
{
  schemaPath: "https://api.example.com/swagger.json",
  serversPath: "./src/apis",
  requestLibPath: "@/request",
  isGenJavaScript: false,
  isCamelCase: true,
  apiPrefix: "'api'",
  requestOptionsType: "{ [key: string]: any }",
}
```

### Scenario 4: Node.js Backend Integration

```typescript
{
  schemaPath: "./api-spec.json",
  serversPath: "./src/clients",
  requestLibPath: "node-fetch",
  isGenJavaScript: true,
  isOnlyGenTypeScriptType: false,
  requestImportStatement: "const request = require('node-fetch');",
  requestOptionsType: "RequestInit",
}
```

### Scenario 5: Quick Prototyping with Mocks

```typescript
{
  schemaPath: "https://petstore.swagger.io/v2/swagger.json",
  serversPath: "./src/apis",
  mockFolder: "./mocks",
  isGenJavaScript: true,
  isDisplayTypeLabel: false,
  isGenReactQuery: false,
  enableLogging: true
}
```

### Scenario 6: International Project (Chinese API)

```typescript
{
  schemaPath: "./openapi.json",
  serversPath: "./src/apis",
  isTranslateToEnglishTag: true,
  isDisplayTypeLabel: true,
  isSupportParseEnumDesc: true,
  // Custom regex for parsing enum descriptions like "普通 = 0" or "SampleMaker = 1"
  supportParseEnumDescByReg: /([^\s=<>/&;]+(?:\s+[^\s=<>/&;]+)*)\s*=\s*(\d+)/g,
  isCamelCase: true,
  filterCaseInsensitive: true,
}
```

### Scenario 7: Large API with Filtering

```typescript
{
  schemaPath: "https://large-api.example.com/openapi.json",
  serversPath: "./src/apis",
  priorityRule: "include",
  includeTags: ["user", "order", "product"],
  filterCaseInsensitive: true,
  isGenReactQuery: true,
  isDisplayTypeLabel: true,
  full: false, // Incremental updates for large APIs
  enableLogging: true
}
```

### Scenario 8: Type-Only Generation

```typescript
{
  schemaPath: "./openapi.json",
  serversPath: "./src/types",
  isOnlyGenTypeScriptType: true,
  isDisplayTypeLabel: true,
  isGenJsonSchemas: true,
  namespace: "APITypes",
  isCamelCase: true,
}
```

### Scenario 9: Custom Request Client

```typescript
{
  schemaPath: "https://api.example.com/openapi.json",
  serversPath: "./src/apis",
  requestLibPath: "@/utils/httpClient",
  requestImportStatement: "import { httpClient as request } from '@/utils/httpClient';",
  requestOptionsType: "CustomRequestOptions",
  apiPrefix: (params) => `api/${params.namespace.toLowerCase()}`,
  isGenReactQuery: true,
}
```

### Scenario 10: Apifox Integration

```typescript
{
  apifoxConfig: {
    projectId: "your-project-id",
    apifoxToken: "your-apifox-token",
    local: "zh-CN",
    selectedTags: ["user", "order"],
    oasVersion: "3.0",
    exportFormat: "JSON",
    branchId: 123, // Optional: branch id
    moduleId: 456  // Optional: module id
  },
  serversPath: "./src/apis",
  isGenReactQuery: true,
  isDisplayTypeLabel: true,
  isSupportParseEnumDesc: true,
}
```

### Scenario 11: Large Project with Module-Based Type Splitting

```typescript
{
  schemaPath: "./openapi.json",
  serversPath: "./src/apis",
  isSplitTypesByModule: true, // Split types by module
  isGenReactQuery: true,
  isDisplayTypeLabel: true,
  isCamelCase: true,
  // Generates:
  // - {module}.type.ts (module-specific types)
  // - common.type.ts (shared types)
  // - enum.ts (all enums)
  // - types.ts (unified export)
}
```

## ⚠️ Configuration Conflicts & Rules

### ❌ Incompatible Combinations

- `isGenJavaScript: true` + `isDisplayTypeLabel: true` (TypeScript types needed for labels)
- `isOnlyGenTypeScriptType: true` + `isGenReactQuery: true` (no functions = no hooks)
- `isGenJavaScript: true` + `isGenJsonSchemas: true` (schemas require TypeScript)
- `isOnlyGenTypeScriptType: true` + `mockFolder` (no functions = no mocks)
- `schemaPath` + `apifoxConfig` (use one or the other, not both)
- `priorityRule: "include"` without `includeTags`/`includePaths` (nothing to include)
- `priorityRule: "exclude"` without `excludeTags`/`excludePaths` (nothing to exclude)

### ⚠️ Performance Warnings

- Large APIs without filtering (`includeTags`/`excludeTags`) = slow generation
- `enableLogging: true` in production = excessive log output
- Too many `includeTags` (>20) = defeats filtering purpose

### ✅ Recommended Combinations

- **React projects**: `isGenReactQuery + isDisplayTypeLabel + isGenJsonSchemas`
- **Vue projects**: `isGenReactQuery + reactQueryMode: 'vue' + isDisplayTypeLabel`
- **Form-heavy apps**: `isDisplayTypeLabel + isSupportParseEnumDesc`
- **Large APIs**: `priorityRule: "include" + includeTags + filterCaseInsensitive`
- **Development**: `mockFolder + enableLogging + full: false`
- **International**: `isTranslateToEnglishTag + isDisplayTypeLabel + isSupportParseEnumDesc`
- **Type-only libraries**: `isOnlyGenTypeScriptType + isGenJsonSchemas + namespace`
- **Large projects**: `isSplitTypesByModule: true + isGenReactQuery + isDisplayTypeLabel`

## 🔧 Advanced Customization Hooks

### 1. Custom Function Naming (`customFunctionName`)

```typescript
// RESTful naming convention
hook: {
  customFunctionName: (data: APIDataType) => {
    const method = data.method;
    const resource = data.path.split('/').filter(Boolean).pop();
    return `${method}${upperFirst(resource)}`;
    // Result: GET /users/{id} → getUsersId
  };
}

// Use operationId with fallback
hook: {
  customFunctionName: (data: APIDataType) => {
    if (data.operationId) {
      return camelCase(data.operationId.replace(/[^a-zA-Z0-9]/g, '_'));
    }
    return `${data.method}${upperFirst(camelCase(data.path))}`;
  };
}

// Domain-specific naming
hook: {
  customFunctionName: (data: APIDataType) => {
    const segments = data.path.split('/').filter(Boolean);
    const version = segments.find((s) => s.match(/^v\d+$/)); // v1, v2, etc.
    const resource = segments[segments.length - 1];
    const action = data.method;
    return version
      ? `${action}${upperFirst(resource)}${upperFirst(version)}`
      : `${action}${upperFirst(resource)}`;
  };
}
```

### 2. Custom Type Names (`customTypeName`)

```typescript
// Add suffix to distinguish request/response types
hook: {
  customTypeName: (data: APIDataType) => {
    const baseName = upperFirst(camelCase(data.operationId || data.path));
    if (data.requestBody) return `${baseName}Request`;
    if (data.responses) return `${baseName}Response`;
    return baseName;
  };
}
```

### 3. Custom Type Generation (`customType`)

```typescript
// Convert numbers to string for precision
hook: {
  customType: ({ schemaObject, namespace, originGetType }) => {
    if (schemaObject.type === 'number' && !schemaObject.format) {
      return 'string'; // Use string for large numbers
    }
    // Convert date-time to Date objects
    if (schemaObject.type === 'string' && schemaObject.format === 'date-time') {
      return 'Date';
    }
    return originGetType(schemaObject, namespace);
  };
}

// Handle custom formats
hook: {
  customType: ({ schemaObject, namespace, originGetType, schemas }) => {
    // Custom decimal type
    if (schemaObject.type === 'string' && schemaObject.format === 'decimal') {
      return 'Decimal';
    }
    // Custom enum handling
    if (schemaObject.enum && schemaObject['x-enum-labels']) {
      return `${namespace}.${upperFirst(schemaObject.title || 'CustomEnum')}`;
    }
    return originGetType(schemaObject, namespace, schemas);
  };
}
```

### 4. Custom Class Names (`customClassName`)

```typescript
// Convert Chinese tags to English
hook: {
  customClassName: (tagName: string) => {
    const chineseToEnglish = {
      用户管理: 'UserManagement',
      订单管理: 'OrderManagement',
      商品管理: 'ProductManagement',
    };
    return chineseToEnglish[tagName] || upperFirst(camelCase(tagName));
  };
}

// Add Controller suffix
hook: {
  customClassName: (tagName: string) => {
    const cleanName = upperFirst(
      camelCase(tagName.replace(/[^a-zA-Z0-9]/g, ''))
    );
    return cleanName.endsWith('Controller')
      ? cleanName
      : `${cleanName}Controller`;
  };
}
```

### 5. Custom File Organization (`customFileNames`)

```typescript
// Group by feature instead of by tag
hook: {
  customFileNames: (operationObject, apiPath, apiMethod) => {
    const pathSegments = apiPath.split('/').filter(Boolean);
    const feature = pathSegments[0]; // First path segment
    return [feature];
  };
}

// Version-based organization
hook: {
  customFileNames: (operationObject, apiPath, apiMethod) => {
    const segments = apiPath.split('/').filter(Boolean);
    const version = segments.find((s) => s.match(/^v\d+$/));
    const resource = segments[segments.length - 1];
    return version ? [`${version}/${resource}`] : [resource];
  };
}

// Method-based file splitting
hook: {
  customFileNames: (operationObject, apiPath, apiMethod) => {
    const tags = operationObject.tags || ['default'];
    const method = apiMethod.toLowerCase();
    return tags.map((tag) => `${camelCase(tag)}.${method}`);
  };
}
```

### 6. Custom Options Default Values (`customOptionsDefaultValue`)

```typescript
// Add timeout and retry logic
hook: {
  customOptionsDefaultValue: (operationObject) => {
    const isFileUpload =
      operationObject.requestBody?.content?.['multipart/form-data'];
    return {
      timeout: isFileUpload ? 30000 : 10000,
      retries: isFileUpload ? 1 : 3,
      validateStatus: (status: number) => status < 400,
    };
  };
}

// Add authentication headers
hook: {
  customOptionsDefaultValue: (operationObject) => {
    const requiresAuth = operationObject.security?.length > 0;
    return requiresAuth
      ? {
          headers: {
            Authorization: 'Bearer ${token}',
          },
        }
      : {};
  };
}
```

### 7. OpenAPI Data Transformation (`afterOpenApiDataInited`)

```typescript
// Add custom extensions to all operations
hook: {
  afterOpenApiDataInited: (openAPIData) => {
    // Add rate limiting info
    Object.values(openAPIData.paths || {}).forEach((pathItem) => {
      Object.values(pathItem).forEach((operation) => {
        if (operation.operationId) {
          operation['x-rate-limit'] = operation['x-rate-limit'] || '100/hour';
        }
      });
    });
    return openAPIData;
  };
}

// Filter out deprecated endpoints
hook: {
  afterOpenApiDataInited: (openAPIData) => {
    Object.keys(openAPIData.paths || {}).forEach((path) => {
      Object.keys(openAPIData.paths[path]).forEach((method) => {
        const operation = openAPIData.paths[path][method];
        if (operation.deprecated) {
          delete openAPIData.paths[path][method];
        }
      });
    });
    return openAPIData;
  };
}
```

### 8. Custom Templates

```typescript
// Custom service controller template
hook: {
  customTemplates: {
    [TypescriptFileType.serviceController]: (apis, context) => {
      return `
// Auto-generated API client
import request from '${context.requestLibPath}';
import type * as API from './types';

${apis.map(api => `
/** ${api.summary || api.path} */
export const ${api.functionName} = async (${api.params}) => {
  return request<${api.responseType}>(\`${api.path}\`, {
    method: '${api.method.toUpperCase()}',
    ${api.data ? `data: ${api.data},` : ''}
    ...options
  });
};
`).join('\n')}
      `;
    }
  }
}
```

## 📁 Generated File Structure

### Default Structure (isSplitTypesByModule: false)

```
src/apis/
├── index.ts           # Main entry point with all exports
├── types.ts           # TypeScript type definitions
├── [controller].ts    # API functions grouped by tags
├── displayTypeLabel.ts # Chinese field labels (if enabled)
├── displayEnumLabel.ts # Enum translations (if enabled)
├── schema.ts          # JSON Schemas (if enabled)
├── reactquery.ts      # React Query hooks (if enabled)
└── mocks/             # Mock data files (if enabled)
    ├── [endpoint].mock.ts
    └── ...
```

### Module-Based Structure (isSplitTypesByModule: true)

```
src/apis/
├── index.ts           # Main entry point with all exports
├── types.ts           # Unified type exports
├── enum.ts            # All enum type definitions
├── common.type.ts     # Shared/common types used by multiple modules
├── [module].type.ts   # Module-specific types (e.g., user.type.ts, order.type.ts)
├── [controller].ts    # API functions grouped by tags
├── displayTypeLabel.ts # Chinese field labels (if enabled)
├── displayEnumLabel.ts # Enum translations (if enabled)
├── schema.ts          # JSON Schemas (if enabled)
├── reactquery.ts      # React Query hooks (if enabled)
└── mocks/             # Mock data files (if enabled)
    ├── [endpoint].mock.ts
    └── ...
```

## 🚀 Performance Optimization Tips

### For Large APIs (100+ endpoints)

```typescript
{
  // Filter by specific tags only
  priorityRule: "include",
  includeTags: ["user", "order", "product"],

  // Or exclude administrative endpoints
  priorityRule: "exclude",
  excludeTags: ["admin", "internal"],

  // Enable case-insensitive filtering
  filterCaseInsensitive: true
}
```

### For Development Speed

```typescript
{
  // Generate JavaScript for faster iteration
  isGenJavaScript: true,

  // Skip heavy features during development
  isDisplayTypeLabel: false,
  isGenJsonSchemas: false,

  // Enable mocks for offline development
  mockFolder: "./mocks"
}
```

## 🔍 Troubleshooting Guide

### Common Issues & Solutions

| Issue | Likely Cause | Solution |
| --- | --- | --- |
| "Missing request method" | Invalid `requestLibPath` | Ensure the import path exists |
| "Type conflicts" | Duplicate type names | Use `namespace` or filter tags |
| "Build errors" | TypeScript version mismatch | Check `typescript` peer dependency |
| "Empty generation" | Restrictive filters | Review `includeTags`/`excludeTags` |
| "Performance slow" | Large API without filtering | Add tag/path filters |

### Validation Checklist

- ✅ OpenAPI spec is valid JSON/YAML
- ✅ `serversPath` directory exists
- ✅ Request library is installed
- ✅ TypeScript configured if using TS features
- ✅ Tags/paths filters are not too restrictive

## 📖 API Reference

### Core Configuration (`GenerateServiceProps`)

See `src/index.ts:27` for complete interface definition.

### Key File Locations

- Main generator: `src/generator/serviceGenarator.ts`
- Type definitions: `src/type.ts`
- Configuration options: `src/generator/config.ts`
- Utility functions: `src/util.ts`

### CLI Usage

```bash
# NPX usage
npx --package=openapi-ts-request -- openapi -i ./openapi.json -o ./apis

# PNPM usage
pnpm --package=openapi-ts-request@latest dlx openapi -i ./openapi.json -o ./apis

# Global installation
npm i -g openapi-ts-request
openapi --input https://api.example.com/openapi.json --output ./src/apis
```

## 🎯 Best Practices for AI Agents

1. **Always validate OpenAPI spec first** before generating
2. **Check project dependencies** to recommend appropriate client
3. **Start with minimal config** then add features incrementally
4. **Use filtering** for large APIs to improve performance
5. **Test generated code** with actual API endpoints
6. **Prefer TypeScript** unless explicitly requested otherwise
7. **Enable type labels** for form-heavy applications
8. **Use mocks** during development phase

---

_This guide is optimized for AI agents to understand and effectively use openapi-ts-request. For human-readable documentation, see README.md_
