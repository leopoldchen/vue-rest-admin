<template>
  <div class="filter-container" v-if="haveSearchParams">
    <div style="margin: 6px;" v-for="filter in quries" :key="filter.name">
      <el-button icon="el-icon-minus" size="mini" circle @click="removeFilter(filter.name)" />
      <span style="width: 120px; display: inline-block"> {{i18n(filter.name)}} </span>
      <el-select style="margin: 0px 10px" v-model="filter.op">
        <el-option v-for="item in filter.options" :key="item.key" :label="item.value" :value="item.key" />
      </el-select>
      <el-date-picker v-if="filter.type=='Date'" style="width: 300px" type="datetime" v-model="filter.value"></el-date-picker>
      <el-input v-else style="width: 300px" size="medium" v-model="filter.value" />
    </div>
    <el-button icon="el-icon-search" type="primary" @click="handleSearch()"> {{$t('search')}} </el-button>
  </div>
</template>

<script>
import _ from 'lodash'
import { getQueryOps, parseQuery } from './queryOps'
import { mapGetters } from 'vuex'
import { getResourceClass } from '@/resources'
import { ActiveQuery } from '@/utils/query'

export default {
  name: 'CRUDFiler',
  props: {
    searchParams: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      quries: {}
    }
  },
  created() {
    this.syncSearchParams()
  },
  watch: {
    searchParams(data) {
      this.syncSearchParams(data)
    }
  },
  methods: {
    i18n(col) {
      return this.resourceClass.i18n(col)
    },
    syncSearchParams(data) {
      data = data || this.searchParams
      const attrs = this.resourceClass.attributes()
      const newQueries = _.cloneDeep(this.quries)
      for (const filter of data) {
        if (!newQueries[filter]) {
          const index = _.findIndex(attrs, attr => attr.name === filter || attr.alias === filter)
          const attr = attrs[index]
          const type = attr.associate ? 'String' : (attr.type || 'String')
          const options = getQueryOps(type)
          let q = filter
          if (attr.associate) {
            const associateField = attr.associateField || getResourceClass(attr.associate).title()
            if (attr.associateAs) {
              q = ActiveQuery.associateKey(attr.associateAs, associateField)
            } else {
              q = ActiveQuery.associateKey(_.snakeCase(attr.associate), associateField)
            }
          }
          newQueries[filter] = {
            name: filter,
            op: 'eq',
            value: '',
            q,
            type,
            options
          }
        }
      }
      this.quries = newQueries
    },
    removeFilter(filter) {
      this.$emit('removeFilter', filter)
      this.quries = _.omit(this.quries, filter)
      this.handleSearch()
    },
    handleSearch() {
      const q = {}
      for (const filter in this.quries) {
        const data = this.quries[filter]
        if (data.value !== '') _.merge(q, parseQuery(data))
      }
      this.$emit('handleSearch', q)
    }
  },
  computed: {
    ...mapGetters({
      resourceClass: 'resourceClass'
    }),
    haveSearchParams() {
      return this.searchParams.length > 0
    }
  }
}
</script>

<style>
.filter-container {
  background-color: #eee;
  margin: 10px 0px;
  padding: 10px;
}
</style>
