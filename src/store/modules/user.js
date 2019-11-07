import { login, getInfo } from '@/api/login';
import { getToken, setToken, removeToken } from '@/utils/auth';

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_ID: (state, id) => {
      state.id = id;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    }
  },

  actions: {
    // 登录
    async Login({ commit }, userInfo) {
      const username = userInfo.username.trim();
      const data = await login(username, userInfo.password);
      // const data = res.data
      setToken(data.token);
      commit('SET_TOKEN', data.token);
    },

    // 获取用户信息
    async GetInfo({ commit }) {
      const data = await getInfo();
      // const data = res.data
      const roles = [];
      if (data.role) {
        roles.push(data.role);
        commit('SET_ROLES', roles);
      } else {
        roles.push('admin');
        commit('SET_ROLES', roles);
      }
      commit('SET_ID', data.id);
      commit('SET_NAME', data.username);
      // commit('SET_AVATAR', data.avatarUrl)
      return roles;
    },

    // 登出
    LogOut({ commit }) {
      commit('SET_TOKEN', '');
      commit('SET_ROLES', []);
      removeToken();
    },

    // 前端 登出
    FedLogOut({ commit }) {
      commit('SET_TOKEN', '');
      removeToken();
    }
  }
};

export default user;
