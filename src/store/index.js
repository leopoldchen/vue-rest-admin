import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import settings from './modules/settings';
import user from './modules/user';
import permission from './modules/permission';
import resource from './modules/resource';
import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    permission,
    resource
  },
  getters
});

export default store;
