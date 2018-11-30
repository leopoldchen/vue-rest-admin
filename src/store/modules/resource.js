import {
  getResourceClass,
  newResource
} from '@/resources'
import _ from 'lodash'

const resource = {
  state: {
    resourceName: undefined,
    resourceClass: undefined,
    resourceList: [],
    selectedResources: [],
    activeResource: undefined,
    queryOptions: {},
    nestedData: {},
    nested: {},
    total: 0,
    actions: {},
    attributes: {},
    api: {}
  },
  mutations: {
    SET_RESOURCE_NAME: (state, { resourceName }) => {
      if (state.resourceName === resourceName) return
      state.resourceName = resourceName
      state.resourceClass = getResourceClass(state.resourceName)
      state.actions = state.resourceClass.actions()
      state.attributes = state.resourceClass.attributes()
      state.api = state.resourceClass.api()
      state.resourceList = []
      state.selectedResources = []
      state.total = 0
      state.activeResource = undefined
      state.queryOptions = {}
      state.nestedData = {}
      state.nested = state.resourceClass.nested()
      for (const item of state.nested) {
        state.nestedData[item.name] = {}
      }
    },
    SET_ACTIVE_RESOURCE: (state, { resource }) => {
      state.activeResource = resource
    },
    SET_QUERY_OPTIONS: (state, { queryOptions }) => {
      state.queryOptions = queryOptions
    },
    SET_RESOURCE_LIST: (state, { resourceList, total }) => {
      state.resourceList = resourceList
      state.total = total
    },
    SET_NESTED_DATA: (state, { nestedData }) => {
      state.nestedData = nestedData
    },
    SET_SELECTED_RESOURCES: (state, { selectedResources }) => {
      state.selectedResources = selectedResources
    }
  },
  actions: {
    setResourceName: ({
      commit
    }, { resourceName }) => {
      commit('SET_RESOURCE_NAME', { resourceName })
    },

    setActiveResource: ({
      commit
    }, { resource }) => {
      commit('SET_ACTIVE_RESOURCE', { resource })
    },

    async setQueryOptions({
      commit, state
    }, {
      queryOptions
    }) {
      await commit('SET_QUERY_OPTIONS', { queryOptions })
      const res = await state.api.list(queryOptions)
      const resourceList = res.rows.map(row => newResource(state.resourceName, row))
      const total = res.count
      await commit('SET_RESOURCE_LIST', { resourceList, total })

      const nestedData = {}
      for (const item of state.nested) {
        const nestedResource = getResourceClass(item.associate)
        const key = item.name
        nestedData[key] = {}
        const idList = _(this.list)
          .map(item => {
            return _.isObject(item[key]) ? item[key].id : item[key]
          })
          .compact()
          .flatten()
          .uniq()
        const list = await nestedResource.api().list({
          id: idList
        })
        for (const item of list.rows) {
          _.merge(nestedData[key], {
            [item.id]: item
          })
        }
      }
      await commit('SET_NESTED_DATA', { nestedData })
    },

    async setSelectedResouces({
      commit
    }, {
      selectedResources
    }) {
      commit('SET_SELECTED_RESOURCES', { selectedResources })
    }
  }
}

export default resource
