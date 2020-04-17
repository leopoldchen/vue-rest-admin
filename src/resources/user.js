import { resourceCRUD } from '@/api/resources';
import BaseResource from './base';
import store from '@/store';

const crudAPI = resourceCRUD('users');

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
        name: 'role',
        required: true,
        component: 'select',
        options: [
          {
            key: 'admin',
            value: 'admin'
          },
          {
            key: 'manager',
            value: 'manager'
          }
        ]
      },
      {
        name: 'desc',
        component: 'text'
      },
      {
        name: 'password',
        show: false,
        search: false
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
      disabled: ['show'],
      extra: [
        {
          name: 'reset',
          button: 'mini',
          width: '100px',
          title() {
            return 'Reset Password';
          },
          async func(row) {
            await store.dispatch('setCustomData', {
              row,
              showResetPasswordDialog: true
            });
          }
        }
      ]
    };
  }
}
