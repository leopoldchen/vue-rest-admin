const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  currentUser: state => state.user,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissionRouters: state => state.permission.routers,
  addRouters: state => state.permission.addRouters
}
export default getters
