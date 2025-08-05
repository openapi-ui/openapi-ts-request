# openapi-ts-request

## 1.6.6

### Patch Changes

- [#425](https://github.com/openapi-ui/openapi-ts-request/pull/425) [`2d2925a`](https://github.com/openapi-ui/openapi-ts-request/commit/2d2925a7e5bc0187e0e3c94ebc609d786ac64577) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: typeName upperFist

## 1.6.5

### Patch Changes

- [#423](https://github.com/openapi-ui/openapi-ts-request/pull/423) [`fb0317e`](https://github.com/openapi-ui/openapi-ts-request/commit/fb0317e3054dbba5a33ca1f625d484a1d97b48b5) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - chore: use node@18

- [#422](https://github.com/openapi-ui/openapi-ts-request/pull/422) [`00820c9`](https://github.com/openapi-ui/openapi-ts-request/commit/00820c9991ad1acffe72d0005cbbb2c5749bc9a9) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - chore: locked some deps version

## 1.6.4

### Patch Changes

- [#419](https://github.com/openapi-ui/openapi-ts-request/pull/419) [`7521be1`](https://github.com/openapi-ui/openapi-ts-request/commit/7521be1876efe45747d8cb2f6f503af2b137d68d) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - chore: locked some deps version

## 1.6.3

### Patch Changes

- [#412](https://github.com/openapi-ui/openapi-ts-request/pull/412) [`4443208`](https://github.com/openapi-ui/openapi-ts-request/commit/444320864838843f1a10ec2190cd1a51f9d647da) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix translateChineseModuleNodeToEnglish not support includeTags

## 1.6.2

### Patch Changes

- [#409](https://github.com/openapi-ui/openapi-ts-request/pull/409) [`948217a`](https://github.com/openapi-ui/openapi-ts-request/commit/948217a34291aef04b820cf15e5f82d0872d5786) Thanks [@asins](https://github.com/asins)! - 为enum类型时对外追加description字段

## 1.6.1

### Patch Changes

- [#398](https://github.com/openapi-ui/openapi-ts-request/pull/398) [`b7dd4d7`](https://github.com/openapi-ui/openapi-ts-request/commit/b7dd4d75c47d7ca3eef72f24778fe9968462ee67) Thanks [@AdoKevin](https://github.com/AdoKevin)! - fix: 修复引用类型返回值在 types.ts中也包含了 namespace 的问题

## 1.6.0

### Minor Changes

- [#381](https://github.com/openapi-ui/openapi-ts-request/pull/381) [`2ac8cf5`](https://github.com/openapi-ui/openapi-ts-request/commit/2ac8cf587b47a0d540b127e37d685f6268bfaf8a) Thanks [@asins](https://github.com/asins)! - feat: 支持通过hooks处理enum types

### Patch Changes

- [#385](https://github.com/openapi-ui/openapi-ts-request/pull/385) [`296739e`](https://github.com/openapi-ui/openapi-ts-request/commit/296739e0e0afc68d2c454e125c65d13ad1b404bc) Thanks [@AdoKevin](https://github.com/AdoKevin)! - fix: refactor test cases to use vitest as testing framework

- [#385](https://github.com/openapi-ui/openapi-ts-request/pull/385) [`296739e`](https://github.com/openapi-ui/openapi-ts-request/commit/296739e0e0afc68d2c454e125c65d13ad1b404bc) Thanks [@AdoKevin](https://github.com/AdoKevin)! - fix: 生成的类型缺少namespace问题

- [#390](https://github.com/openapi-ui/openapi-ts-request/pull/390) [`97baffc`](https://github.com/openapi-ui/openapi-ts-request/commit/97baffcf3f907cba1e304107d9e8c8a6327270ac) Thanks [@AdoKevin](https://github.com/AdoKevin)! - fix: 新增的 enum label hook中取变量错误

- [#385](https://github.com/openapi-ui/openapi-ts-request/pull/385) [`296739e`](https://github.com/openapi-ui/openapi-ts-request/commit/296739e0e0afc68d2c454e125c65d13ad1b404bc) Thanks [@AdoKevin](https://github.com/AdoKevin)! - style: prefer type import

- [#392](https://github.com/openapi-ui/openapi-ts-request/pull/392) [`d4d19c8`](https://github.com/openapi-ui/openapi-ts-request/commit/d4d19c835630e0bff61bfdc571183944feb9484b) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - chore: clean test script

- [#392](https://github.com/openapi-ui/openapi-ts-request/pull/392) [`0d2ac27`](https://github.com/openapi-ui/openapi-ts-request/commit/0d2ac2724bcf9b74a6eb88242635d2962d3ac406) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf parmas customTemplates type definition

- [#392](https://github.com/openapi-ui/openapi-ts-request/pull/392) [`3b75878`](https://github.com/openapi-ui/openapi-ts-request/commit/3b75878234417cd663d3b5c3554eb454212ddc0c) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - chore: add user documentation

## 1.5.2

### Patch Changes

- [#376](https://github.com/openapi-ui/openapi-ts-request/pull/376) [`42ee4b9`](https://github.com/openapi-ui/openapi-ts-request/commit/42ee4b9de17e49c18aa78f316fc1359249501d91) Thanks [@AdoKevin](https://github.com/AdoKevin)! - priorityRule 为 both 和 include 的时候都设置includeTags, includePaths 的默认值为[/.*/g]

- [#377](https://github.com/openapi-ui/openapi-ts-request/pull/377) [`27de009`](https://github.com/openapi-ui/openapi-ts-request/commit/27de009901996f1fd6947cccbd3788c74e2ebdfd) Thanks [@AdoKevin](https://github.com/AdoKevin)! - feat: 枚举类型支持空格

## 1.5.1

### Patch Changes

- [#371](https://github.com/openapi-ui/openapi-ts-request/pull/371) [`3da8faf`](https://github.com/openapi-ui/openapi-ts-request/commit/3da8fafcc90809c8c6f3178ab67113b06d75d66f) Thanks [@eamd-wq](https://github.com/eamd-wq)! - fix: 修复配置includePaths时，没有按照includePaths进行type过滤，而是生成了全量的type

## 1.5.0

### Minor Changes

- [#332](https://github.com/openapi-ui/openapi-ts-request/pull/332) [`23a7c2a`](https://github.com/openapi-ui/openapi-ts-request/commit/23a7c2a7096c00074e19832c9fa96a97d04864e3) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: anonymous body, response type generates named type

## 1.4.0

### Minor Changes

- [#321](https://github.com/openapi-ui/openapi-ts-request/pull/321) [`c6a2894`](https://github.com/openapi-ui/openapi-ts-request/commit/c6a28942eba0c2729127d327f7356f66fe2f4397) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support response type comments

### Patch Changes

- [#321](https://github.com/openapi-ui/openapi-ts-request/pull/321) [`6822ae9`](https://github.com/openapi-ui/openapi-ts-request/commit/6822ae95f5c69b08a9274fe454d15b154c2bff4e) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf empty tags behavior, related bug #300

## 1.3.4

### Patch Changes

- [#301](https://github.com/openapi-ui/openapi-ts-request/pull/301) [`6e2ac36`](https://github.com/openapi-ui/openapi-ts-request/commit/6e2ac36293a53ae222d784661858fb8c45fbfca1) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix bug #294

## 1.3.3

### Patch Changes

- [#291](https://github.com/openapi-ui/openapi-ts-request/pull/291) [`36032b8`](https://github.com/openapi-ui/openapi-ts-request/commit/36032b82cc1c3e5e286ed0b84692bbe1d7596095) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix parse multiple file lose

## 1.3.2

### Patch Changes

- [#274](https://github.com/openapi-ui/openapi-ts-request/pull/274) [`e404129`](https://github.com/openapi-ui/openapi-ts-request/commit/e404129c7c932e2945bac1acf92baa00191f3cda) Thanks [@Autumnshi](https://github.com/Autumnshi)! - feat: support custom templates

## 1.3.1

### Patch Changes

- [#266](https://github.com/openapi-ui/openapi-ts-request/pull/266) [`1aed4e8`](https://github.com/openapi-ui/openapi-ts-request/commit/1aed4e8902eee4f43a3759fae212a52c63cdfd5a) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support extra apifox config

## 1.3.0

### Minor Changes

- [#153](https://github.com/openapi-ui/openapi-ts-request/pull/153) [`3a659f1`](https://github.com/openapi-ui/openapi-ts-request/commit/3a659f12d4932998a70efc8821b44e78ee74e95d) Thanks [@JsonLee12138](https://github.com/JsonLee12138)! - feat: 新增增量修改，方法命名规范，合并openapi-ts和openapi命令

### Patch Changes

- [#153](https://github.com/openapi-ui/openapi-ts-request/pull/153) [`3a659f1`](https://github.com/openapi-ui/openapi-ts-request/commit/3a659f12d4932998a70efc8821b44e78ee74e95d) Thanks [@JsonLee12138](https://github.com/JsonLee12138)! - feat: cli concurrency and timeout support and uniquekey filpath support

## 1.2.0

### Minor Changes

- [#224](https://github.com/openapi-ui/openapi-ts-request/pull/224) [`8d35f62`](https://github.com/openapi-ui/openapi-ts-request/commit/8d35f62867997d23d0b1ac7771db3976d6179bae) Thanks [@sabernagato](https://github.com/sabernagato)! - parse enum description to generate enum label

### Patch Changes

- [#225](https://github.com/openapi-ui/openapi-ts-request/pull/225) [`08ba109`](https://github.com/openapi-ui/openapi-ts-request/commit/08ba109a2fb2285ee60cb2610517d6bd07b18f3f) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf display number enum label

- [#225](https://github.com/openapi-ui/openapi-ts-request/pull/225) [`39d2de9`](https://github.com/openapi-ui/openapi-ts-request/commit/39d2de9a6d277f202173d4eeeeda02e00db346c1) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - docs: fix customType hook api

## 1.1.2

### Patch Changes

- [#172](https://github.com/openapi-ui/openapi-ts-request/pull/172) [`5674dda`](https://github.com/openapi-ui/openapi-ts-request/commit/5674dda35d0ce0ceefd25bc7f5ba58e6c3f09020) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix custom reactQuery queryOptions type

## 1.1.1

### Patch Changes

- [#170](https://github.com/openapi-ui/openapi-ts-request/pull/170) [`2b55838`](https://github.com/openapi-ui/openapi-ts-request/commit/2b55838474ac3c24ba08a66ce1b7759a97fa313e) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix cosmiconfig TypeScriptLoader

## 1.1.0

### Minor Changes

- [#167](https://github.com/openapi-ui/openapi-ts-request/pull/167) [`f2ae8da`](https://github.com/openapi-ui/openapi-ts-request/commit/f2ae8da962d99999a0fc5de7438cd8165eb31d76) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support vue-query

## 1.0.1

### Patch Changes

- [#161](https://github.com/openapi-ui/openapi-ts-request/pull/161) [`5230b8d`](https://github.com/openapi-ui/openapi-ts-request/commit/5230b8dcd076099c80db160c48501f884026c17a) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix npx default params lose

## 1.0.0

### Major Changes

- [#155](https://github.com/openapi-ui/openapi-ts-request/pull/155) [`a553cc1`](https://github.com/openapi-ui/openapi-ts-request/commit/a553cc1b1e66d92641711c68c309bf53c3f3243a) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - refactor: refactor client request params to adapt support react-query

### Minor Changes

- [#155](https://github.com/openapi-ui/openapi-ts-request/pull/155) [`015f573`](https://github.com/openapi-ui/openapi-ts-request/commit/015f5739b74c697fea0d71c2bde6d56eea3d627b) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support generate react-query

- [#155](https://github.com/openapi-ui/openapi-ts-request/pull/155) [`8028361`](https://github.com/openapi-ui/openapi-ts-request/commit/8028361485c03735c76e0ead9a42b7a168c1aeb1) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support generate JavaScript

### Patch Changes

- [#155](https://github.com/openapi-ui/openapi-ts-request/pull/155) [`323e394`](https://github.com/openapi-ui/openapi-ts-request/commit/323e394350c1fd85f032985ad297da5f206ee6a6) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf translate multiple Chinese tag into English tag

## 0.13.4

### Patch Changes

- [#141](https://github.com/openapi-ui/openapi-ts-request/pull/141) [`9bfad84`](https://github.com/openapi-ui/openapi-ts-request/commit/9bfad841514251b3db04b5efbf4a0489b6de8cd8) Thanks [@a876691666](https://github.com/a876691666)! - docs: enrich readme files

- [#142](https://github.com/openapi-ui/openapi-ts-request/pull/142) [`7ce604c`](https://github.com/openapi-ui/openapi-ts-request/commit/7ce604c23d0f1a97ded8dd7bc8c7c7cd981fa220) Thanks [@Soramii](https://github.com/Soramii)! - docs: update readme

## 0.13.3

### Patch Changes

- [#137](https://github.com/openapi-ui/openapi-ts-request/pull/137) [`1c1cce9`](https://github.com/openapi-ui/openapi-ts-request/commit/1c1cce9c0361ef31e1677db0b685743af6250973) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf parse apifox x-apifox-enum

## 0.13.2

### Patch Changes

- [#130](https://github.com/openapi-ui/openapi-ts-request/pull/130) [`80deff8`](https://github.com/openapi-ui/openapi-ts-request/commit/80deff803e30911e329a58cdf6ea3e29fc27fbe7) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: compatible default tags is empty

- [#130](https://github.com/openapi-ui/openapi-ts-request/pull/130) [`80deff8`](https://github.com/openapi-ui/openapi-ts-request/commit/80deff803e30911e329a58cdf6ea3e29fc27fbe7) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf string_number enum

## 0.13.1

### Patch Changes

- [#123](https://github.com/openapi-ui/openapi-ts-request/pull/123) [`c80a6aa`](https://github.com/openapi-ui/openapi-ts-request/commit/c80a6aab2fac1ae14fc363a2b9e133170ec3189a) Thanks [@lezzhao](https://github.com/lezzhao)! - fix: fix generate number type enum error #117

## 0.13.0

### Minor Changes

- [#111](https://github.com/openapi-ui/openapi-ts-request/pull/111) [`09c2731`](https://github.com/openapi-ui/openapi-ts-request/commit/09c273106ad082a0c42dfaf2c6f974b4adb5501c) Thanks [@remember-5](https://github.com/remember-5)! - feat: support priorityRule

### Patch Changes

- [#114](https://github.com/openapi-ui/openapi-ts-request/pull/114) [`9755877`](https://github.com/openapi-ui/openapi-ts-request/commit/9755877d7115600f6f91d8643d97ccde0f2cc9f5) Thanks [@remember-5](https://github.com/remember-5)! - fix: generate type file loss

- [#113](https://github.com/openapi-ui/openapi-ts-request/pull/113) [`2c70f78`](https://github.com/openapi-ui/openapi-ts-request/commit/2c70f78eb51f544f1106a72d3fb6eb5d228ecd41) Thanks [@remember-5](https://github.com/remember-5)! - chore: rename allowedTags => includeTags, allowedPaths => includePaths

- [`4ea7857`](https://github.com/openapi-ui/openapi-ts-request/commit/4ea7857247da937c5b5783ebe5f211af9dae65c4) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf priorityRule feature code

## 0.12.1

### Patch Changes

- [`46f42bd`](https://github.com/openapi-ui/openapi-ts-request/commit/46f42bd2ec4fc5fff2683af66abc74db81ceebe9) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf parse number enum

## 0.12.0

### Minor Changes

- [`cb2dd36`](https://github.com/openapi-ui/openapi-ts-request/commit/cb2dd366db46724f0a59ff9394c08c1d4503a4c5) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support only generate typescript type

## 0.11.1

### Patch Changes

- [`135c407`](https://github.com/openapi-ui/openapi-ts-request/commit/135c4075c4989c7365dd2adff4fdbd9d95456488) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: support schemas array[enum]

## 0.11.0

### Minor Changes

- [`899e8ad`](https://github.com/openapi-ui/openapi-ts-request/commit/899e8adf5cb9033acb21a0426c0ea6278b746998) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support apifox x-run-in-apifox

### Patch Changes

- [`fc29191`](https://github.com/openapi-ui/openapi-ts-request/commit/fc29191ddcf6a2779326ca5feef583a511be23bb) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - docs: update readme

- [`b93d87a`](https://github.com/openapi-ui/openapi-ts-request/commit/b93d87ad2283b8bea8553b8c68049ead6368bce4) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix parse schema items error

## 0.10.0

### Minor Changes

- [`b0f3e41`](https://github.com/openapi-ui/openapi-ts-request/commit/b0f3e416ee25398f242b2bac07cdca4f73e69bf4) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support x-apifox enumDescriptions

## 0.9.0

### Minor Changes

- [#89](https://github.com/openapi-ui/openapi-ts-request/pull/89) [`80c575a`](https://github.com/openapi-ui/openapi-ts-request/commit/80c575a5b5578e3ff32deae2347e28259f3e1adf) Thanks [@lezzhao](https://github.com/lezzhao)! - feat: support for 'components' non-schemas fields

## 0.8.4

### Patch Changes

- [`5c1e70d`](https://github.com/openapi-ui/openapi-ts-request/commit/5c1e70d9b293b30fa667974436ef6d3af2481230) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf serviceController template import sort

## 0.8.3

### Patch Changes

- [`430c164`](https://github.com/openapi-ui/openapi-ts-request/commit/430c1648fa0cb1737ed83f762bff434678488c50) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix $ref includes encode character causing allowedTags function error

## 0.8.2

### Patch Changes

- [`f8ee256`](https://github.com/openapi-ui/openapi-ts-request/commit/f8ee2562e3e7733c11657edcd2387bb86435ffe5) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf entry export

## 0.8.1

### Patch Changes

- [`91bb707`](https://github.com/openapi-ui/openapi-ts-request/commit/91bb7071e47198c0341871e4c6ef17b72360f5ef) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix apifox $ref includes encode character

## 0.8.0

### Minor Changes

- [`11d4e53`](https://github.com/openapi-ui/openapi-ts-request/commit/11d4e531163ec6ebcea02c9f8b4c888ee6a3db60) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: adjust entry export

## 0.7.0

### Minor Changes

- [`a3aa314`](https://github.com/openapi-ui/openapi-ts-request/commit/a3aa31483b36049c2032a5f64b636e633c23fd93) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support docs authorization

## 0.6.0

### Minor Changes

- [`44eb25b`](https://github.com/openapi-ui/openapi-ts-request/commit/44eb25bd6e4be8cd6ff7a945b5bade81ad665251) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support translate chinese tag name to english tag name

### Patch Changes

- [`62e0ce2`](https://github.com/openapi-ui/openapi-ts-request/commit/62e0ce23029451941984ca4bda23d2802228c6e5) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - chore: update dependencies

## 0.5.0

### Minor Changes

- [`3f89463`](https://github.com/openapi-ui/openapi-ts-request/commit/3f89463ba83421e690454051d528a50825460932) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support parse swagger.yml/openapi.yml

## 0.4.11

### Patch Changes

- [`ee82d00`](https://github.com/openapi-ui/openapi-ts-request/commit/ee82d00aed28e1db3111edb29527c0833d999120) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix query field complexType definition

- [`cf8ef92`](https://github.com/openapi-ui/openapi-ts-request/commit/cf8ef925bc5d6cd3c68694922d0c800bda4dcbea) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - docs: add introduction for adapting to uniapp

## 0.4.10

### Patch Changes

- [`f4a2370`](https://github.com/openapi-ui/openapi-ts-request/commit/f4a2370ce3e9e09c723c2b8938acaff87ce8ac79) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix bug #51

## 0.4.9

### Patch Changes

- [`3bc210d`](https://github.com/openapi-ui/openapi-ts-request/commit/3bc210d2154b0e597343a86f1e47f965d8312920) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix bug #49

## 0.4.8

### Patch Changes

- [`94801b6`](https://github.com/openapi-ui/openapi-ts-request/commit/94801b68ca3048bd505b1b44cac8ba35c0d13d66) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - chore: update husky script

- [`cdecb3f`](https://github.com/openapi-ui/openapi-ts-request/commit/cdecb3f48de524a5dd4c3e34ba5f23021aa0646c) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - docs: update readme

- [`83721a1`](https://github.com/openapi-ui/openapi-ts-request/commit/83721a13c860c0b19f310e4dbe717c2d03347127) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix apiPrefix match error

## 0.4.7

### Patch Changes

- [`ace4a34`](https://github.com/openapi-ui/openapi-ts-request/commit/ace4a348d21fd9528b91e7d82efec10fab12af24) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf displayEnumLabel when no enums

- [`7de3b58`](https://github.com/openapi-ui/openapi-ts-request/commit/7de3b583060b2baf16b52a27296b7dbc2568a138) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix schema is undefined when mark schema

## 0.4.6

### Patch Changes

- [`f34d2fc`](https://github.com/openapi-ui/openapi-ts-request/commit/f34d2fc1430b26a7bd27d60ae84625e46acaefb5) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf: perf tip

## 0.4.5

### Patch Changes

- [`b7ab3c3`](https://github.com/openapi-ui/openapi-ts-request/commit/b7ab3c3fd98bf99133da60dc921522a00bfb766c) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix module not found errors when .ts config includes import

- [`01ca65e`](https://github.com/openapi-ui/openapi-ts-request/commit/01ca65ed32bfeed12c3b28722b7e1db0904fefef) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - docs: fix cosmiConfig usage

## 0.4.4

### Patch Changes

- [`58ffc56`](https://github.com/openapi-ui/openapi-ts-request/commit/58ffc566418cbd8bb923bf8c85066a2d0857b08c) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix npx --input url error

## 0.4.3

### Patch Changes

- [`da215fe`](https://github.com/openapi-ui/openapi-ts-request/commit/da215fe6339253f33047fd20a7c200d8a7b5cd7a) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - docs: update npx script

## 0.4.2

### Patch Changes

- [`34b24a6`](https://github.com/openapi-ui/openapi-ts-request/commit/34b24a6eaf94aaa8e952689a8497b872797bfdf3) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix npx run error

## 0.4.1

### Patch Changes

- [`e85bbb9`](https://github.com/openapi-ui/openapi-ts-request/commit/e85bbb96200787ad14be08c8ebd9fc2390664d34) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix npx error

## 0.4.0

### Minor Changes

- [`0f1a6a7`](https://github.com/openapi-ui/openapi-ts-request/commit/0f1a6a75b452102738364b32d808b0609d37b3a3) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support work with npx, CLI

## 0.3.4

### Patch Changes

- [`788eb6b`](https://github.com/openapi-ui/openapi-ts-request/commit/788eb6bea6335f35342b0051cbf420d739f0b9b7) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - docs: add English readme

## 0.3.3

### Patch Changes

- [#16](https://github.com/openapi-ui/openapi-ts-request/pull/16) [`e48cb2b`](https://github.com/openapi-ui/openapi-ts-request/commit/e48cb2b1a4550cefa71469d589491576e34069d6) Thanks [@zhao-coder123](https://github.com/zhao-coder123)! - fix: fix prettier format error

## 0.3.2

### Patch Changes

- [`30ddb72`](https://github.com/openapi-ui/openapi-ts-request/commit/30ddb728b5b4eeae363d70a55f23f22b98c71359) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix allowTags repeat mark

## 0.3.1

### Patch Changes

- [`98ef7b3`](https://github.com/openapi-ui/openapi-ts-request/commit/98ef7b3c666fdcdd4d9dc39c132eb2f3d364c371) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix serviceIndex import

## 0.3.0

### Minor Changes

- [`91452d7`](https://github.com/openapi-ui/openapi-ts-request/commit/91452d76cd8e2d3f7b0e81de7973e9c001028d6d) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: support gen JSON Schemas

## 0.2.0

### Minor Changes

- [`8ee8143`](https://github.com/openapi-ui/openapi-ts-request/commit/8ee8143cbdc07c95a30ab2f6a6b6486e3659600e) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: add display type label

## 0.1.3

### Patch Changes

- [`2917b2a`](https://github.com/openapi-ui/openapi-ts-request/commit/2917b2aba7a3be9298464c39c9d02ee6991294c8) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - ci: fix unsetting npm registry to force ci to fail

## 0.1.2

### Patch Changes

- [`a684e48`](https://github.com/openapi-ui/openapi-ts-request/commit/a684e4803af84370939560c5a068b647839817da) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - fix: fix auto prepublish, fix error types entry

## 0.1.1

### Patch Changes

- [`33b4c73`](https://github.com/openapi-ui/openapi-ts-request/commit/33b4c736501eca182049801a38c36e571a74781e) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - test: add test case(filter spec by tags)

- [`7f78ed8`](https://github.com/openapi-ui/openapi-ts-request/commit/7f78ed80c38c20e799613056312b4dd09156d178) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - ci: fix test assert force ci to fail

- [`388f59d`](https://github.com/openapi-ui/openapi-ts-request/commit/388f59db2c79549e5e1edc03d17e4a5ac241e201) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - ci: fix multiple versions of pnpm specified conflict

- [`4b4863e`](https://github.com/openapi-ui/openapi-ts-request/commit/4b4863e4b11855bf981a0d4ebbae11e1c8712615) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - ci: fix changeset version fail

- [`1740013`](https://github.com/openapi-ui/openapi-ts-request/commit/17400130d6d52b978391859aae114b0545747e43) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - perf any type => unknown type

## 0.1.0

### Minor Changes

- [`be0c3b8`](https://github.com/openapi-ui/openapi-ts-request/commit/be0c3b87d34318dcba36a69da5466e09b54afeb3) Thanks [@rookie-luochao](https://github.com/rookie-luochao)! - feat: init
