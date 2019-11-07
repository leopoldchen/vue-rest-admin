import _ from 'lodash';
import moment from 'moment';
import { newResource, getResourceClass } from '@/resources';
import { rolesCan } from '@/utils/cancan';
import { ActiveQuery } from '@/utils/query';
import { mapGetters, mapActions } from 'vuex';
import CRUDTable from './table';
import CRUDForm from './form';
import CRUDShow from './show';
import CRUDPaginate from './paginate';
import CRUDFilter from './filter';

const DEFAULT_ACTIONS = ['create', 'show', 'edit', 'delete', 'export'];
const FORMAT = {
  date: 'YYYY-MM-DD HH:mm'
};

export default {
  props: {
    resource: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        perPage: 20,
        order: ''
      },
      listFilter: {},
      dialogFormVisible: false,
      showingFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'edit',
        create: 'create'
      },
      downloadLoading: false,
      searchParams: []
    };
  },
  async created() {
    await this.setResourceName({ resourceName: this.resource });
    await this.getList();
  },
  methods: {
    ...mapActions({
      setResourceName: 'setResourceName',
      setActiveResource: 'setActiveResource',
      setQueryOptions: 'setQueryOptions'
    }),
    i18n(col) {
      return this.resourceClass.i18n(col);
    },
    can(action) {
      if (
        this.actions.disabled &&
        _.indexOf(this.actions.disabled, action) === -1
      ) {
        return rolesCan(this.roles, action, this.resourceClass);
      }
    },
    async getList() {
      this.listLoading = true;
      const query = this.resourceClass.queryFilter(new ActiveQuery());
      const queryOptions = query
        .where(this.listFilter)
        .paginate(this.listQuery.page, this.listQuery.perPage)
        .order(this.listQuery.order).query;
      await this.setQueryOptions({ queryOptions });
      this.listLoading = false;
    },
    colFilter(col, row) {
      const value = _.get(row, col.name);
      if (value === null || value === undefined) return '';
      if (col.filter) return col.filter(value);
      if (col.associate) {
        const item = _.get(row, col.associateAs || _.snakeCase(col.associate));
        return (
          (item &&
            (item[col.associateField] || item[this.getNestedAttr(col.name)])) ||
          value
        );
      }
      if (col.type === 'Date') {
        return moment(value).format(FORMAT.date);
      }
      return value;
    },
    getNestedAttr(name) {
      for (const item of this.nested) {
        if (item.name === name) return getResourceClass(item.associate).title();
      }
    },
    async handleAction(action, row) {
      if (_.indexOf(DEFAULT_ACTIONS, action) !== -1) {
        return this[`handle${_.capitalize(action)}`](row);
      } else {
        const index = _.findIndex(this.actions.extra, {
          name: action
        });
        if (index !== -1) {
          const extraAction = this.actions.extra[index];
          const func =
            extraAction.func || this[`handle${_.capitalize(action)}`];
          if (!func) throw new Error('Missing action' + action);
          if (extraAction.confirmMsg) {
            this.$confirm(extraAction.confirmMsg(row), '', {
              confirmButtonText: this.$t('ok'),
              cancelButtonText: this.$t('cancel'),
              type: 'warning'
            })
              .then(async () => {
                await func(row);
                this.getList();
              })
              .catch(() => {
                this.$message({
                  type: 'error',
                  message: this.$t('base.failed.message')
                });
              });
          } else {
            await func(row);
            this.getList();
          }
        }
      }
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.perPage = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    async handleCreate() {
      const resource = {};
      _.forEach(this.resourceClass.attributes(), attr => {
        if (
          (attr.required || attr.edit !== false) &&
          attr.default !== undefined
        ) {
          resource[attr.name] = _.isFunction(attr.default)
            ? attr.default()
            : attr.default;
        }
      });
      this.setActiveResource({ resource });
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
    },
    async handleEdit(row) {
      const resource = this.list[
        this.list.findIndex(item => item.id === row.id)
      ];
      this.setActiveResource({ resource });
      this.dialogStatus = 'update';
      this.dialogFormVisible = true;
    },
    async handleShow(row) {
      const resource = this.list[
        this.list.findIndex(item => item.id === row.id)
      ];
      this.setActiveResource({ resource });
      this.showingFormVisible = true;
    },
    handleExport() {
      if (this.selected.length === 0) {
        this.$message({
          type: 'error',
          message: this.$t('base.failed.empty')
        });
        return;
      }
      this.downloadLoading = true;
      const exportAttrs = this.resourceClass.exportAttrs();
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = exportAttrs.map(item => this.i18n(item.name));
        const data = this.selected.map(row =>
          exportAttrs.map(col => this.colFilter(col, row))
        );
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        });
        this.downloadLoading = false;
      });
    },
    async createData(data) {
      try {
        await this.api.create(data);
        this.dialogFormVisible = false;
        this.handleCurrentChange(1);
        this.$notify({
          title: this.$t('success'),
          message: this.$t('base.success.create'),
          type: 'success',
          duration: 2000
        });
      } catch (err) {
        console.error(err);
      }
    },
    async updateData(data) {
      let temp = newResource(this.resource, data);
      try {
        temp = await this.api.update(temp);
        for (const v of this.list) {
          if (v.id === temp.id) {
            const index = this.list.indexOf(v);
            this.list.splice(index, 1, temp);
            break;
          }
        }
        this.dialogFormVisible = false;
        this.$notify({
          title: this.$t('success'),
          message: this.$t('base.success.update'),
          type: 'success',
          duration: 2000
        });
        this.getList();
      } catch (err) {
        console.error(err);
      }
    },
    async handleDelete(row) {
      this.$confirm(this.$t('base.confirm.delete'), this.$t('delete'), {
        confirmButtonText: this.$t('ok'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      })
        .then(() => {
          this.api
            .destroy(row)
            .then(() => {
              this.$notify({
                title: this.$t('success'),
                message: this.$t('base.success.delete'),
                type: 'success',
                duration: 2000
              });
              this.getList();
            })
            .catch(err => {
              console.error(err);
              this.$message({
                type: 'error',
                message: this.$t('base.failed.delete')
              });
            });
        })
        .catch(err => {
          console.error(err);
          this.$message({
            type: 'error',
            message: this.$t('base.failed.delete')
          });
        });
    },
    handleDeleteAll() {
      if (this.selected.length === 0) {
        this.$message({
          type: 'error',
          message: this.$t('base.failed.empty')
        });
        return;
      }
      this.$confirm(this.$t('base.confirm.deleteList'), this.$t('delete'), {
        confirmButtonText: this.$t('ok'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      })
        .then(() => {
          this.api
            .destroyAll({
              ids: this.selected.map(row => row.id)
            })
            .then(() => {
              this.$notify({
                title: this.$t('success'),
                message: this.$t('base.success.delete'),
                type: 'success',
                duration: 2000
              });
              this.getList();
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(() => {
          this.$message({
            type: 'error',
            message: this.$t('base.failed.delete')
          });
        });
    },
    handleSort(column, order) {
      this.listQuery.order = column ? column + '-' + order : undefined;
      this.getList();
    },
    handleAddFilter(filter) {
      if (_.indexOf(this.searchParams, filter) === -1) {
        this.searchParams.push(filter);
      }
    },
    handleRemoveFilter(filter) {
      const index = _.indexOf(this.searchParams, filter);
      if (index !== -1) this.searchParams.splice(index, 1);
    },
    handleSearch(q) {
      this.listFilter = q;
      this.getList();
    }
  },
  computed: {
    ...mapGetters({
      roles: 'roles',
      nested: 'nested',
      list: 'resourceList',
      activeRow: 'activeResource',
      selected: 'selectedResources',
      resourceName: 'resourceName',
      resourceClass: 'resourceClass',
      total: 'total',
      api: 'api',
      attributes: 'attributes',
      actions: 'actions'
    }),
    showingData() {
      if (!this.showingFormVisible) return [];
      const data = [];
      _.forEach(this.attributes, item => {
        data.push({
          key: item.name,
          value: this.activeRow[item.name]
        });
      });
      return data;
    },
    searchableFilters() {
      return this.resourceClass
        .searchAttrs()
        .map(attr => attr.alias || attr.name);
    }
  },
  components: {
    'crud-table': CRUDTable,
    'crud-form': CRUDForm,
    'crud-show': CRUDShow,
    'crud-paginate': CRUDPaginate,
    'crud-filter': CRUDFilter
  }
};
