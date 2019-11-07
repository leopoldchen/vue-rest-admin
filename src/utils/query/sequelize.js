import _ from 'lodash';

export default class SequelizeQuery {
  constructor() {
    this.query = {
      where: {},
      include: [],
      order: []
    };
  }

  static associateKey(model, name) {
    return `$${model}.${name}$`;
  }

  static queryKey(attr, op) {
    return attr + '-' + op;
  }

  // example: {'name-eq': 'abc'} => {where: {name: {$eq: "abc"}}}
  // nested: {'user-name-eq': 'abc'} => {where: {$user.name$: {$eq: "abc"}}}
  where(q = {}) {
    for (const key in q) {
      const k = key.split('-');
      if (k.length !== 2) throw new Error('Invalid query');
      k[k.length - 1] = '$' + k[k.length - 1];
      this.query.where[k[0]] = {
        [k[1]]: q[key]
      };
    }
    return this;
  }

  paginate(page = 1, perPage = 10) {
    this.query.limit = perPage;
    this.query.offset = perPage * (page - 1);
    return this;
  }

  // example: createdAt-DESC => rule: ['createdAt', 'DESC']
  // nested: user-createdAt-DESC => rule: ['User', 'createdAt', 'DESC']
  order(str) {
    if (!str) return this;
    const rule = str.split('-');
    if (rule.length < 2) throw new Error('Invalid order');
    for (let i = 0; i < rule.length - 2; i++) {
      rule[i] = _.capitalize(rule[i]);
    }
    this.query.order.push(rule);
    return this;
  }

  include(rule) {
    this.query.include.push(rule);
    return this;
  }
}
