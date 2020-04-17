# Resource

前端 resource 映射

## attributes

顾名思义，在 attributes 方法中定义 resource 的属性，此方法访问一个数组，包含一组属性。

单个属性的定义有诸多参数，如下：

### name

属性名称，**必须有**，不可缺

### type

属性类型，比如'String', 'Number'等，可选，默认值为‘String’

### title

是否为 resource 的 title，在下拉选项或者数据嵌套时，作为页面显示，并且在下拉检索时作为搜索条件，默认值为 false。**注：只能设置一个属性的 title 为 true，如果没有属性被设置为 title，默认会使用 name 属性作为 title，如果不存在 name，则继续显示为空。**

### required

是否不能为空，用于创建和更新时的验证，默认为 false

### edit

是否可以被编辑，用于创建和更新时的显示，默认为 true

### show

是否可以显示在列表中，默认为 true

### search

是否可以作为过滤条件，默认为 true

### sort

是否可以作为排序条件，默认为 true

### export

是否可以被导出，默认为 true

### alias

字段重命名，比如 userId 希望显示为 mobile，那么可以 alias 为 mobile，这样在 i18n 及条件过滤的时候都会使用 mobile，并且在做关联查询时也按 mobile 字段处理。

### associate

是否为外键嵌套，可以指定为另一个 resource。比如属性名为 userId，association 为 User 这个 resource。
一旦指定 resource 会产生如下效果：

- 列表中不再直接显示外键 id，而是会显示关联表的 title 字段值，比如为 user.username 值
- 在编辑时，会自动转换为下拉搜索

### associateAs

后端有时候会对 associate 表做特殊映射，比如将 userId 映射为 author，并在返回的数据中把对应的数据填充在 author 字段中。
前端对应的填写此映射，这样框架将字段读取 author 字段，而不是 user 字段

### associateField

前端有时候需要显示关联表中的特殊字段信息，比如关联了 user 表，默认显示 username，而在某些特殊情形下希望显示 phone，那么可以将此字段设置为 phone

### multiple

与 associate 属性配合使用，在指定 associate 的前提下使用。比如关联了多个 user，属性名为 userIds，此时，如果 multiple 为 true，前端在编辑时，便可自动使用多选模式

### component

指定属性使用的 component，支持'input','text','select','time','rate'等

### options

当指定 component 为 select 时，需添加 options 数据作为选项

### filter

定义一个方法，传入属性值，返回转化后的值。一般用于状态转换，比如 status 值为 1,2,可能待办的意义的未完成和已完成，我们希望显示时用未完成代替 1，用已完成代替 2

### default

定义一个方法，返回默认的属性值。
之所以是方法是为了处理默认值与运行时相关的情况，比如默认值为当前登入用户的 id

### rules

定义一组规则，用于前端验证。参照[element ui rule 设定](http://element.eleme.io/#/zh-CN/component/form#form-attributes)

### width

在列表中的宽度值，不设置则与其他列均等

## api

返回一个 object，包含一组 api 方法，比如通常情况下，一个 resource 需要可以增删改查，即：

```javascript
static api() {
  return {
    list：function() {...},
    create: ...,
    update: ...,
    destroy: ...,
  }
end
```

如果有一些额外的 api 方法，亦可加入到 object 对象中。

## actions

通常 resource 的管理需要有增删改查等操作，actions 方法就是负责定义 resource 在界面上可执行的 action，具体格式如下：

```javascript
static actions() {
  return {
    disabled: ['show'], // ['create', 'edit', 'destroy', 'show']
    extra: []
  }
}
```

其中 disabled 可以禁用界面上的某些 action，比如禁用 show，界面上的查看按钮就会被隐藏

extra 则是添加自定义方法，其参数包括：

- name 方法名
- button 设置按钮样式
- func 方法封装，支持 async， 传入参数 row 和 that（用户调用confirm等操作），可以在这里更新store中的数据，从而实现复杂的交互
- title 按钮标题，为 function, 传入参数 row
- confirmMsg 是否需要弹窗确认操作，为 function， 传入参数 row
