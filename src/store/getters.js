const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  currentUser: state => state.user,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissionRouters: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,

  resourceList: state => state.resource.resourceList,
  activeResource: state => state.resource.activeResource,
  selectedResources: state => state.resource.selectedResources,
  resourceName: state => state.resource.resourceName,
  resourceClass: state => state.resource.resourceClass,
  total: state => state.resource.total,
  actions: state => state.resource.actions,
  attributes: state => state.resource.attributes,
  api: state => state.resource.api,
  nested: state => state.resource.nested
};
export default getters;
