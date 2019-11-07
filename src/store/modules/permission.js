import { asyncRouters, constantRouters } from '@/router';
import { rolesCan } from '@/utils/cancan';

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.resource) return rolesCan(roles, 'view', route.resource);
  return true;
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouters
 * @param roles
 */
function filterAsyncRouter(asyncRouters, roles) {
  const accessedRouters = asyncRouters.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles);
      }
      return true;
    }
    return false;
  });
  return accessedRouters;
}

const permission = {
  state: {
    routers: constantRouters,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers;
      state.routers = constantRouters.concat(routers);
    }
  },
  actions: {
    async GenerateRoutes({ commit }, data) {
      const { roles } = data;
      let accessedRouters;
      if (roles.includes('admin')) {
        accessedRouters = asyncRouters;
      } else {
        accessedRouters = filterAsyncRouter(asyncRouters, roles);
      }
      commit('SET_ROUTERS', accessedRouters);
      return accessedRouters;
    }
  }
};

export default permission;
