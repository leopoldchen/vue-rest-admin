// Base Model for resources
import _ from 'lodash'
import {
  i18n
} from '../i18n'

export default class BaseResource {
  constructor(row) {
    const attrs = this.constructor.attributes()
    if (row) {
      for (const attr of attrs) {
        this[attr.name] = _.get(row, attr.name)
      }
    }
  }

  // resource rest API
  static api() {
    throw new Error('Please define the resource API!')
  }

  /*
    resource attributes
    example:
    [
      {
        name: 'state',
        type: 'Number', // ['String', 'Number']
        required: true,
        width: '100px',
        rules: [
          {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change'}
        ],
        filter: (value) => {
          const statusMap = {
            0: '待用',
            1: '已使用',
            2: '禁用'
          }
          return statusMap[status]
        }
      }
    ]
  */
  static attributes() {
    return []
  }

  /*
    resource action settings, including disabled and extra actions.
    default actions are ['create', 'destroy', 'update', 'download'].
    example:
      {
        disabled: ['destroy'],
        extra: [
          {
            name: 'publish',
            func: (row) => {alert(row.id)},
            button: 'normal'
          }
        ]
      }
  */
  static actions() {
    return {
      disabled: ['show'], // ['create', 'edit', 'destroy', 'show']
      extra: []
    }
  }

  static nested() {
    const attrs = this.attributes()
    const nested = []

    for (const attr of attrs) {
      if (attr.associate) {
        nested.push(attr)
      }
    }
    return nested
  }

  static title() {
    const attrs = this.attributes()

    for (const attr of attrs) {
      if (attr.title) {
        return attr.name
      }
    }
    return 'name'
  }

  static attrFilter(key) {
    const attrs = []
    this.attributes().forEach(attr => {
      if (attr[key] !== false) {
        attrs.push(attr)
      }
    })
    return attrs
  }

  static requiredAttrs() {
    return this.attrFilter('required')
  }

  static editableAttrs() {
    return this.attrFilter('edit')
  }

  static showableAttrs() {
    return this.attrFilter('show')
  }

  static exportAttrs() {
    return this.attrFilter('export')
  }

  static searchAttrs() {
    return this.attrFilter('search')
  }

  static attrRules() {
    const rules = {}
    this.attributes().forEach(attr => {
      if (attr.required) {
        rules[attr.name] = [{
          required: true,
          message: attr.requiredMessage || `${attr.name} is required`,
          trigger: attr.requiredTrigger || 'change'
        }]
      }
      if (attr.rules) {
        rules[attr.name] = _.concat(rules[attr.name], attr.rules)
      }
    })
    return rules
  }

  static i18n(col) {
    return i18n.t(['resources', this.name, 'attr', col].join('.'))
  }
}
