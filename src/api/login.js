import createService from '@/utils/request'

const request = createService()

export function login(username, password) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo() {
  return request({
    url: '/api/user/current',
    method: 'get'
  })
}
