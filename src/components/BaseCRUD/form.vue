<template>
  <div class="form-container">
    <el-form :rules="attrRules" ref="dataForm" :model="model" label-position="left" label-width="120px" style='width: 400px; margin-left:50px;'>
      <el-form-item v-for="attr in attrs" :key="attr.name" :label="i18n(attr.name)" :prop="attr.name">
        <el-select v-if="attr.associate" v-model="model[attr.name]" filterable remote :remote-method="searchAssociate(attr)" :loading="loading" :multiple="attr.multiple">
          <el-option v-for="item in associateOptions[attr.name]" :key="item.key" :label="item.value" :value="item.key" />
        </el-select>
        <el-input v-else-if="attrComponent(attr, 'input')" v-model="model[attr.name]" />
        <el-input v-else-if="attrComponent(attr, 'text')" v-model="model[attr.name]" type="textarea" />
        <el-select v-else-if="attrComponent(attr, 'select')" v-model="model[attr.name]">
          <el-option v-for="item in attr.options" :key="item.key" :label="item.value" :value="item.key">
          </el-option>
        </el-select>
        <el-date-picker v-else-if="attrComponent(attr, 'time')" v-model="model[attr.name]" type="datetime" />
        <el-rate v-else-if="attrComponent(attr, 'rate')" style="margin-top:8px;" v-model="model[attr.name]" :colors="attr.colors" :max='attr.max'></el-rate>
      </el-form-item>
    </el-form>
    <div slot="footer" class="form-footer">
      <el-button @click="cancel">{{$t('cancel')}}</el-button>
      <el-button v-if="status=='create'" type="primary" @click="createData">{{$t('save')}}</el-button>
      <el-button v-else type="primary" @click="updateData">{{$t('update')}}</el-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { getResourceClass } from '@/resources'

export default {
  name: 'CRUDFrom',
  props: {
    resourceClass: {
      required: true
    },
    status: String,
    formData: Object
  },
  data() {
    return {
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      model: {},
      associateOptions: {},
      loading: false
    }
  },
  created() {
    this.initModel()
  },
  watch: {
    formData(data) {
      this.initModel()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    }
  },
  methods: {
    i18n(col) {
      return this.resourceClass.i18n(col)
    },
    attrComponent(attr, type) {
      const comp = attr.component || 'input'
      return comp === type
    },
    initModel() {
      this.model = _.cloneDeep(this.formData || {})
      if (this.status === 'create') {
        this.loadDefaultValues()
      }
      this.loadModelAssociate()
    },
    loadDefaultValues() {
      _.forEach(this.resourceClass.attributes(), (attr) => {
        if ((attr.required || attr.edit) && attr.default !== undefined) {
          this.model[attr.name] = _.isFunction(attr.default) ? attr.default() : attr.default
        }
      })
    },
    async loadModelAssociate() {
      this.loading = true
      this.associateOptions = {}
      for (const attr of this.attrs) {
        if (attr.associate) {
          if (this.model[attr.name] && !attr.multiple && this.edit !== false) {
            const associateClass = getResourceClass(attr.associate)
            const item = await associateClass.api().get(this.model[attr.name])
            this.associateOptions[attr.name] = [
              {
                key: item.id,
                value: item[associateClass.title()]
              }
            ]
          } else if (this.model[attr.name] && attr.multiple && this.model[attr.name].length > 0) {
            const associateClass = getResourceClass(attr.associate)
            const list = await associateClass.api().list({
              'x-page': 1,
              'x-per-page': 20,
              'id-in': this.model[attr.name]
            })
            this.associateOptions[attr.name] = list.rows.map(item => {
              return {
                key: item.id,
                value: item[associateClass.title()]
              }
            })
          } else {
            await this.searchAssociate(attr)('')
          }
        }
      }
      this.loading = false
    },
    searchAssociate(attr) {
      const self = this
      const associateClass = getResourceClass(attr.associate)
      return async query => {
        this.loading = true
        const queryParam = { 'x-per-page': 50 }
        if (query !== '') {
          queryParam[associateClass.title() + '-like'] = query + '%'
        }
        const list = await associateClass.api().list(queryParam)
        self.associateOptions[attr.name] = list.rows.map(item => {
          return {
            key: item.id,
            value: item[associateClass.title()]
          }
        })
        this.loading = false
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    async createData() {
      const valid = await this.$refs['dataForm'].validate()
      valid && this.$emit('create', this.model)
    },
    async updateData() {
      const valid = await this.$refs['dataForm'].validate()
      valid && this.$emit('update', this.model)
    }
  },
  computed: {
    attrs() {
      return this.resourceClass.editableAttrs()
    },
    attrRules() {
      return this.resourceClass.attrRules()
    }
  }
}
</script>

<style scoped>
.form-footer {
  text-align: right;
}
</style>

