<template>
  <div class="table-container" v-loading="listLoading">
    <el-table :data="list" element-loading-text="Loading..." border fit highlight-current-row style="width: 100%" @sort-change="handleSort">
      <el-table-column align="center" v-for="col in attrs" :key="col.name" :prop="col.name" :label="i18n(col.name)" :width="col.width" sortable="custom">
        <template slot-scope="scope">
          <span> {{filter(col, rowValue(scope.row, col.name))}} </span>
        </template>
      </el-table-column>

      <el-table-column align="center" :width="actionAreaWidth" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="can('show')" size="mini" @click="handleAction('show', scope.row)">{{$t('show')}}</el-button>
          <el-button v-if="can('edit')" type="primary" size="mini" @click="handleAction('edit', scope.row)">{{$t('edit')}}</el-button>
          <el-button v-if="can('delete')" type="warning" size="mini" @click="handleAction('delete', scope.row)">{{$t('delete')}}</el-button>
          <el-button v-for="op in canActions" :key="op.name" @click="handleAction(op.name, scope.row)" size="mini" :type="op.button">{{$t(op.name)}}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import _ from 'lodash'
import { rolesCan } from '@/utils/cancan'
import { mapGetters } from 'vuex'

export default {
  name: 'CRUDTable',
  props: {
    listLoading: Boolean,
    list: {
      type: Array,
      default: () => {
        return {}
      }
    },
    resourceClass: {
      required: true
    },
    filter: {
      type: Function,
      default: (col, value) => {
        return value
      }
    }
  },
  data() {
    return {
      cachedCan: {}
    }
  },
  methods: {
    i18n(col) {
      return this.resourceClass.i18n(col)
    },
    can(action) {
      if (this.cachedCan[action] === undefined) {
        if (
          this.resourceClass.actions().disabled &&
          _.indexOf(this.resourceClass.actions().disabled, action) === -1
        ) {
          this.cachedCan[action] = rolesCan(
            this.roles,
            action,
            this.resourceClass
          )
        } else {
          this.cachedCan[action] = false
        }
      }
      return this.cachedCan[action]
    },
    rowValue(row, key) {
      return _.get(row, key)
    },
    handleAction(action, row) {
      this.$emit('handleAction', action, row)
    },
    handleSort(evt) {
      const order = evt.order === 'descending' ? 'desc' : 'asc'
      this.$emit('handleSort', evt.prop, order)
    }
  },
  computed: {
    ...mapGetters({
      roles: 'roles'
    }),
    actionAreaWidth() {
      const defaultLength = ['show', 'edit', 'destroy'].length
      const disableLength = (this.resourceClass.actions().disabled || []).length
      const extraLength = (this.resourceClass.actions().extra || []).length
      const buttonWidth = 80
      return (defaultLength - disableLength + extraLength) * buttonWidth
    },
    canActions() {
      const extraAxtions = this.resourceClass.actions().extra || []
      return _.remove(extraAxtions, action => {
        !this.can(action)
      })
    },
    attrs() {
      return this.resourceClass.showableAttrs()
    }
  }
}
</script>

<style>
.table-container {
  margin: 10px 0px;
}
</style>
