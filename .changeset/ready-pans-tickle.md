---
'openapi-ts-request': patch
---

fix: 修复配置includePaths时，没有按照includePaths进行type过滤，而是生成了全量的type
