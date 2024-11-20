# 配置项

- `allowedTags` 允许的tags
- `excludeTags` 排除的tas
- `allowedPaths` 允许的paths
- `excludePaths` 排除的paths

# 模式介绍

三种模式

1. allowed
2. exclude
3. both

支持正则匹配，同时支持文件路径匹配

在此列表中`[/a/a1, /a/a2, /a/aa3/aaa3, /a/aa4/aaa4/aaaa4]`

`/a/*` = `[/a/a1, /a/a2]`

`/a/**` = `[/a/a1, /a/a2, /a/a3/a33, /a/a44/a444/a4444]`

## allowed模式

```
// 在白名单则生成
if(include(allowedList)){
	// 生成代码
}
```

## exclude模式

```
// 不在黑名单则生成
if(!include(excludeList)){
	// 生成代码
}
```

## include模式

如果tag是直接描述

1. 系统/系统消息
2. 订单/订单消息
3. 订单/优惠卷

这样更符合include 和 exclude ，可以用通配符 `/系统/*` ,`/订单/*`

```
// 在白名单且不在黑名单则生成
if(include(allowedList) && !include(excludeList)){
	// 生成代码
}
```

AllTag

```
AllTag: [
	sys-a,sys-b,sys-c,
	user-x,user-y,user-z
]
```

AllPath

```
AllPath: [
	/a/a1,/a/a2,/a/a3,/a/a4,
	/b/b1,/b/b2,/b/b3,/b/b4,
	....
]
```

# Tag测试

| 模式 | allowedTag | excludeTag | 结果 |
| --- | --- | --- | --- |
| allowed模式 | [sys-a,sys-b,sys-c] | [user-x,user-y,user-z] | [sys-a,sys-b,sys-c] |
| allowed模式 | [] | [user-x,user-y,user-z] | [] |
| allowed模式 | [] | [] | [] |
| allowed模式 | [user-*] | [] | [user-x,user-y,user-z] |
|  |  |  |  |
| exclude模式 | [sys-a] | [sys-a,user-z] | [sys-b,sys-c,user-x,user-y] |
| exclude模式 | [sys-a,user-z] | [] | [sys-a,sys-b,sys-c,user-x,user-y,user-z] |
| exclude模式 | [a,z] | [user-\*,sys-\*] | [] |
| exclude模式 | [] | [] | [sys-a,sys-b,sys-c,user-x,user-y,user-z] |
|  |  |  |  |
| include模式2 | [sys-a,sys-b,sys-c,user-z] | [sys-c,user-z] | [sys-a,sys-b] |
| include模式2 | [sys-*] | [sys-a,sys-b,user-x] | [sys-c] |
| include模式2 | [sys-\*,user-\*] | [*] | [] |
| include模式2 | [*] | [] | [sys-a,sys-b,sys-c,user-x,user-y,user-z] |
|  |  |  |  |

# path测试

| 模式 | allowedTag | allowedPaths | excludeTag | excludePaths | 结果 |
| --- | --- | --- | --- | --- | --- |
| allowed | ['*'] | [/sys-a/\*,/sys-b/\*,/sys-c/\*] | [] | [/user-x/\*,/user-y/\*,/user-z/\*] | [/sys-a/\*,/sys-b\*,/sys-c\*] |
| allowed | ['*'] | [] | [] | [/user-x,/user-y,/user-z] | [] |
| allowed | ['*'] | [] | [] | [] | [] |
| allowed | ['*'] | [/sys-a/*] | [] | [] | [/sys-a/a1/aa1,/sys-a/a1/aa1/aaa1,/sys-a/a1/aa1/aaa1/aaaa1] |
| allowed |  |  |  |  |  |
|  |  |  |  |  |  |
| exclude |  | [/sys-a/**] |  | [/sys-a/\**,/user-z/\**] | [/sys-b/\**,/sys-c/\*,/user-x/\*,/user-y/\*] |
| exclude |  | [/sys-a/\*,/user-z/\*] |  | [] | [/sys-a/\*,/sys-b/\*,/sys-c/\*,/user-x/\*,/user-y/\*,/user-z/\*] |
| exclude |  | [a,z] |  | [/sys-a/\*,/user-z/\*] | [] |
| exclude |  | [] |  | [] | [/sys-a/\*,/sys-b/\*,/sys-c/\*,/user-x/\*,/user-y/\*,/user-z/\*] |
|  |  |  |  |  |  |
| include |  | [/sys-a/\**,/user-z/\*] |  | [/sys-c/\*,/user-z/*] | [/sys-a/\**] |
| include |  | [/user-x/**] |  | [/user-x/x1] | [/user-x/x1/xx1,/user-x/x1/xx1/xxx1,/user-x/x1/xx1/xxx1/xxxx1] |
|  |  |  |  |  |  |
