import _ from 'lodash';
import CanCan from 'cancan';
import { newResource, getResourceClass } from '@/resources';

const cancan = new CanCan();
const { allow, can } = cancan;

/**
 * actions:
 * 1. view. can show the list
 * 2. create. can create
 * 3. show. can show the details
 * 4. edit. can edit and update
 * 5. delete. can delete
 */

const Role = getResourceClass('role');

allow(Role, 'manage', 'all', role => {
  return role.name === 'admin';
});

export const roleCan = (role, action, resource) => {
  const roleInstance = _.isString(role)
    ? newResource('role', { name: role })
    : newResource('role', role);
  const resourceClass = _.isString(resource)
    ? getResourceClass(resource)
    : resource;
  return can(roleInstance, action, resourceClass);
};

export const rolesCan = (roles, action, resource) => {
  for (const role of roles) {
    if (roleCan(role, action, resource)) return true;
  }
  return false;
};

export const uCan = (user, action, resource) => {
  return rolesCan(user.roles, action, resource);
};

export default {
  roleCan,
  rolesCan,
  uCan
};
