<template>
  <div v-loading="listLoading" class="table-container">
    <el-table
      ref="multipleTable"
      :data="list"
      element-loading-text="Loading..."
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="handleSort"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        v-for="col in attrs"
        :key="col.alias || col.name"
        align="center"
        :prop="col.name"
        :label="i18n(col.alias || col.name)"
        :width="col.width"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span> {{ filter(col, scope.row) }} </span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        :width="actionAreaWidth"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="can('show')"
            size="mini"
            @click="handleAction('show', scope.row)"
            >{{ $t('show') }}</el-button
          >
          <el-button
            v-if="can('edit')"
            type="primary"
            size="mini"
            @click="handleAction('edit', scope.row)"
            >{{ $t('edit') }}</el-button
          >
          <el-button
            v-if="can('destroy')"
            type="warning"
            size="mini"
            @click="handleAction('delete', scope.row)"
            >{{ $t('delete') }}</el-button
          >
          <el-button
            v-for="op in canActions"
            :key="op.name"
            size="mini"
            :type="op.button"
            @click="handleAction(op.name, scope.row)"
            >{{ op.title() }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import _ from 'lodash';
import { rolesCan } from '@/utils/cancan';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'CRUDTable',
  props: {
    listLoading: Boolean,
    filter: {
      type: Function,
      default: (col, value) => {
        return value;
      }
    }
  },
  data() {
    return {
      cachedCan: {}
    };
  },
  computed: {
    ...mapGetters({
      roles: 'roles',
      resourceClass: 'resourceClass',
      list: 'resourceList'
    }),
    actionAreaWidth() {
      const defaultAction = ['show', 'edit', 'delete'];
      const disabled = this.resourceClass.actions().disabled || [];
      const extraLength = this.canActions.length;
      const buttonWidth = 80;
      return (
        (_.difference(defaultAction, disabled).length + extraLength) *
        buttonWidth
      );
    },
    canActions() {
      const extraAxtions = this.resourceClass.actions().extra || [];
      _.remove(extraAxtions, action => {
        return !this.can(action.name);
      });
      return extraAxtions;
    },
    attrs() {
      return this.resourceClass.showableAttrs();
    }
  },
  methods: {
    ...mapActions({
      setSelectedResouces: 'setSelectedResouces'
    }),
    i18n(col) {
      return this.resourceClass.i18n(col);
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
          );
        } else {
          this.cachedCan[action] = false;
        }
      }
      return this.cachedCan[action];
    },
    handleAction(action, row) {
      this.$emit('handleAction', action, row);
    },
    handleSort(evt) {
      const order = evt.order === 'descending' ? 'desc' : 'asc';
      this.$emit('handleSort', evt.prop, order);
    },
    handleSelectionChange(selectedResources) {
      this.setSelectedResouces({ selectedResources });
    }
  }
};
</script>

<style>
.table-container {
  margin: 10px 0px;
}
</style>
