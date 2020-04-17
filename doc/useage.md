# 概要

[vue-rest-admin](https://github.com/leopoldchen/vue-rest-admin)是一款功能强大的 Dashboard 脚手架，基于[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)，提供了面向 resource 的可配置的 CRUD 组件，可以在短时间内实现一个具有列表、排序、筛选、分页、新增、编辑、删除、导出等功能的 resource 管理页面。

## 使用

## 目录结构

```
- build
- config
- src
  - api 将api的封装放在此处
  - assets
  - components
    - BaseCRUD 核心代码
    - ...
  - i18n
  - resources 将resource的封装放在此处
  - router
  - store
  - styles
  - utils
  - vendor
  - views 新增的view页面放这里
...

```

## 新手上路

1. 封装 API
   > 将后端 api 的封装放在一处，便于更新和复用。

```javascript
// api/user.js
import createService from '@/utils/request'

const request = createService() // 参考vue-admin-template

// 封装list、create、update、destroy、get等基础api
const url = '/api/admin/users'

export default {
  {
    list(data) {
      return request({
        method: 'post',
        url: url + '/search',
        data
      })
    },
    create(data) {
      return request({
        method: 'post',
        url,
        data
      })
    },
    update(data) {
      const params = {}
      _.forEach(data, (value, key) => {
        _.set(params, key, value)
      })
      return request({
        method: 'put',
        url: url + '/' + data.id,
        data: params
      })
    },
    destroy(data) {
      return request({
        method: 'delete',
        url: url + '/' + data.id,
        data
      })
    },
    destroyAll(data) {
      return request({
        method: 'delete',
        url: url + '/destroyAll',
        data
      })
    },
    get(id) {
      return request({
        method: 'get',
        url: url + '/' + id
      })
    }
  }
}

```

后端提供 REST 操作接口，支持基于 sequelize 脚本指令的操作，具体 sample 参考[后端脚手架](https://github.com/leopoldchen/egg-ts-sequlize-redis-boilerplate)

2. 添加并注册 resource
   > /resources/user.js

```javascript
import crudAPI from '@/api/users';
import BaseResource from './base';

export default class User extends BaseResource {
  static attributes() {
    return [
      {
        name: 'id',
        type: 'Number',
        edit: false
      },
      {
        name: 'username',
        type: 'String',
        title: true,
        required: true
      },
      {
        name: 'createdAt',
        type: 'Date',
        edit: false
      },
      {
        name: 'updatedAt',
        type: 'Date',
        edit: false
      }
    ];
  }

  static api() {
    return crudAPI;
  }

  static actions() {
    return {
      disabled: ['create', 'delete', 'edit']
    };
  }
}
```

更多配置，参考[resource 文档](https://github.com/leopoldchen/vue-rest-admin/blob/master/doc/resource.md)

注册 resource： 打开 resources/index.js，添加 User 引用，并将 User 添加到 resources 列表，如：

```javascript
import User from './user';

export const resources = {
  User
};
```

3. 添加 view
   > /views/user/index.vue

```html
<template>
  <base-crud resource="User" />
</template>

<script>
  import BaseCRUD from '@/components/BaseCRUD';

  export default {
    components: {
      'base-crud': BaseCRUD
    }
  };
</script>
```

在 user 页中引用 base crud 组件

4. 添加 router

此处可参考[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)文档

5. 启动服务，登录 dashboard，查看页面

## 进阶

### Resource 设置

请参考[Resource 文档](https://github.com/leopoldchen/vue-rest-admin/blob/master/doc/resource.md)

### 自定义 view

由于 baseCRUD 组件封装的是基础的增删改查操作，而且提供了简单的设置和扩展，但是在实际工作中可能会有更多新的需求。大概分为：

1. 有部分功能和 crud 组件相似，由于 crud 组件是子组件的组装，程序员可以自行再组装以满足自身需求
2. 完全不需要使用 crud 功能，比如可能只是需要显示图表，这时候请自行引入[vue-admin-template](https://github.com/PanJiaChen/vue-admin-template)的其他组件并使用
3. 通过为添加额外的action，触发store数据变更，可以使得交互更加多样化，比如做一个单独的reset password 页面。
