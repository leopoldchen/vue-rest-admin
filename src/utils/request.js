import axios from 'axios';
import { Message } from 'element-ui';
import store from '@/store';
import { getToken } from '@/utils/auth';

export default function createService(baseUrl, timeout) {
  const service = axios.create({
    baseURL: baseUrl || process.env.VUE_APP_BASE_API,
    timeout: timeout || 5000
  });

  service.interceptors.request.use(
    config => {
      if (store.getters.token) {
        config.headers['token'] = getToken();
      }
      return config;
    },
    error => {
      // Do something with request error
      console.log(error); // for debug
      Promise.reject(error);
    }
  );

  service.interceptors.response.use(
    response => {
      const res = response.data;
      if (response.status >= 400) {
        Message({
          message: res.message,
          type: 'error',
          duration: 5 * 1000
        });
        return Promise.reject('error');
      } else {
        return response.data;
      }
    },
    error => {
      console.log('err' + error); // for debug
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      });
      return Promise.reject(error);
    }
  );

  return service;
}
