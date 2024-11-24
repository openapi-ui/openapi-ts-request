# 配置项

- `includeTags` 允许的tags
- `includePaths` 允许的paths
- `excludeTags` 排除的tags
- `excludePaths` 排除的paths

# 匹配支持

## 正则匹配

通用型正则，不在赘述

## 文件路径匹配

! ！注意是文件路径，错误示例： `xx-*` 这种不属于文件路径，需要更换为正则通配符正确示例：在此列表中`[/a/a1, /a/a2, /a/aa3/aaa3, /a/aa4/aaa4/aaaa4]`  
匹配 `/a/*` = `[/a/a1, /a/a2]`  
匹配 `/a/**` = `[/a/a1, /a/a2, /a/a3/a33, /a/a44/a444/a4444]`

# 模式介绍

三种模式

1. include
2. exclude
3. both

所有Tag如下:

```
AllTag: [
    sys-a,sys-b,sys-c,    user-x,user-y,user-z]
```

所有Path如下:

```
AllPath: [
    /a/a1,/a/a2,/a/a3,/a/a4,    /b/b1,/b/b2,/b/b3,/b/b4,    ....]
```

# Include 模式

Include 模式只接收 includeTags,includePaths 参数，不接收 excludeTags,excludePaths 参数

如果 includeTags 和 includePaths 同时存在，includeTags 是对 includePaths 的筛选结果再进行筛选

```
// 在白名单则生成
if(include(includeList)){
    // 生成代码
}
```

| includeTags | includePaths | excludeTags | excludePaths | 结果 | 备注 |
| --- | --- | --- | --- | --- | --- |
| [] | [] | [] | [] | [] = includeTags | includetags为空，跳过所有步骤 |
| [] | ['/sys-a/\**','/sys-b/\**','/sys-c/\**'] | [] | [] | [] = includeTags | includetags为空，跳过所有步骤 |
| [/.*/g] | [] | [] | [] | [/.*/g] = includeTags |  |
| [/.*/g] | ['/sys-a/\**','/sys-b/\**','/sys-c/\**'] | [] | [] | ['/sys-a/\**','/sys-b/\**','/sys-c/\**'] = includePaths |  |
| ['sys-a'] | ['/sys-a/a/a1/aa1/\**'] | [] | [] | ['/sys-a/a/a1/aa1/aaa1','/sys-a/a/a1/aa1/aaa1/aaaa1'] | 通配符规则 |
| ['sys-a','user-z'] | ['/**'] | [] | [] | ['/sys-a/\**','/user-z/\**'] |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

# Exclude模式

Exclude 模式只接收 excludeTags,excludePaths 参数，不接收 includeTags,includePaths 参数

如果 excludeTags 和 excludePaths 同时存在，excludeTags 是对 excludePaths 的筛选结果再进行筛选

```
// 不在黑名单则生成
if(!include(excludeList)){
    // 生成代码
}
```

| includeTags | includePaths | excludeTags | excludePaths | 结果 | 备注 |
| --- | --- | --- | --- | --- | --- |
| [] | [] | [] | [] | [/.*/g] | 没有排除项，生成所有 |
| [] | [] | ['sys-a,'user-z'] | [] | ['/sys-b/\**', '/sys-c/\**', '/user-x/\**', '/user-y/\**'] | 全集与excludeTags的差集 |
| [] | [] | [] | ['/sys-a/\**','/user-z/\**'] | ['/sys-b/\**', '/sys-c/\**', '/user-x/\**', '/user-y/\**'] | 全集与excludeTags的差集 |
| [] | [] | [/.*/g] | [] | [] | 排除了所有，是空集 |
| [] | [] | ['sys-a','user-z'] | ['/sys-b/\**','/user-y/\**'] | ['/sys-c/\**', '/user-x/\**'] | 先排除tag，然后排除path |

# Both模式

Both 模式可同时接收 includeTags,includePaths,excludeTags,excludePaths 参数

如果tag是直接描述

1. 系统/系统消息
2. 订单/订单消息
3. 订单/优惠卷

这样更符合include 和 exclude ，可以用通配符 `/系统/*` ,`/订单/*`

```
// 在白名单且不在黑名单则生成
if(include(includeList) && !include(excludeList)){
    // 生成代码
}
```

| includeTags(为空会生成空数组) | includePaths | excludeTags | excludePaths | 结果 | 备注 |
| --- | --- | --- | --- | --- | --- |
| [] | [] | [] | [] | [] |  |
| [/.*/g] | [] | [] | [] | [/.*/g] |  |
| [/.*/g] | ['/sys-a/**'] | [] | ['/sys-a/a1/**'] | ['/sys-a/a1'] |  |
| [/.*/g] | ['/sys-a/**','/user-z/\**'] | [] | ['/sys-c/**','/user-z/\**'] | ['/sys-a/**'] |  |
| [/.*/g] | [] | ['sys-b','sys-c','user-x','user-y'] | ['/sys-a/**', '/user-z/z1/zz1/\**'] | ['/user-z/z1', '/user-z/z1/zz1'] |  |
