import BaseResource from './base';

export default class Role extends BaseResource {
  static attributes() {
    return [
      {
        name: 'name',
        type: 'String'
      }
    ];
  }
}
