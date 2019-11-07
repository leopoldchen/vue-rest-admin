<template>
  <div class="form-container">
    <el-form
      ref="dataForm"
      :rules="attrRules"
      :model="model"
      label-position="left"
      label-width="120px"
      style="width: 400px; margin-left:50px;"
    >
      <el-form-item
        v-for="attr in attrs"
        :key="attr.name"
        :label="i18n(attr.alias || attr.name)"
        :prop="attr.name"
      >
        <el-select
          v-if="attr.associate"
          v-model="model[attr.name]"
          filterable
          remote
          :remote-method="searchAssociate(attr)"
          :loading="loading"
          :multiple="attr.multiple"
        >
          <el-option
            v-for="item in associateOptions[attr.name]"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
        <el-input
          v-else-if="attrComponent(attr, 'input')"
          v-model="model[attr.name]"
        />
        <el-input
          v-else-if="attrComponent(attr, 'text')"
          v-model="model[attr.name]"
          type="textarea"
        />
        <el-select
          v-else-if="attrComponent(attr, 'select')"
          v-model="model[attr.name]"
        >
          <el-option
            v-for="item in attr.options"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
        <el-date-picker
          v-else-if="attrComponent(attr, 'time')"
          v-model="model[attr.name]"
          type="datetime"
        />
        <el-rate
          v-else-if="attrComponent(attr, 'rate')"
          v-model="model[attr.name]"
          style="margin-top:8px;"
          :colors="attr.colors"
          :max="attr.max"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="form-footer">
      <el-button @click="cancel">{{ $t('cancel') }}</el-button>
      <el-button v-if="status == 'create'" type="primary" @click="createData">{{
        $t('save')
      }}</el-button>
      <el-button v-else type="primary" @click="updateData">{{
        $t('update')
      }}</el-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { getResourceClass } from '@/resources';
import { mapGetters } from 'vuex';
import { ActiveQuery } from '@/utils/query';

export default {
  name: 'CRUDFrom',
  props: {
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
    };
  },
  computed: {
    ...mapGetters({
      resourceClass: 'resourceClass'
    }),
    attrs() {
      return this.resourceClass.editableAttrs();
    },
    attrRules() {
      return this.resourceClass.attrRules();
    }
  },
  watch: {
    formData(data) {
      this.initModel();
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    }
  },
  created() {
    this.initModel();
  },
  methods: {
    i18n(col) {
      return this.resourceClass.i18n(col);
    },
    attrComponent(attr, type) {
      const comp = attr.component || 'input';
      return comp === type;
    },
    initModel() {
      this.model = _.cloneDeep(this.formData || {});
      this.loadModelAssociate();
    },
    async loadModelAssociate() {
      this.loading = true;
      this.associateOptions = {};
      for (const attr of this.attrs) {
        if (attr.associate) {
          if (this.model[attr.name] && !attr.multiple && this.edit !== false) {
            const associateClass = getResourceClass(attr.associate);
            const item = await associateClass.api().get(this.model[attr.name]);
            this.associateOptions[attr.name] = [
              {
                key: item.id,
                value: item[associateClass.title()]
              }
            ];
          } else if (
            this.model[attr.name] &&
            attr.multiple &&
            this.model[attr.name].length > 0
          ) {
            const associateClass = getResourceClass(attr.associate);
            const queryOptions = new ActiveQuery()
              .where({ 'id-in': this.model[attr.name] })
              .paginate(1, 20).query;
            const list = await associateClass.api().list(queryOptions);
            this.associateOptions[attr.name] = list.rows.map(item => {
              return {
                key: item.id,
                value: item[associateClass.title()]
              };
            });
          } else {
            await this.searchAssociate(attr)('');
          }
        }
      }
      this.loading = false;
    },
    searchAssociate(attr) {
      const self = this;
      const associateClass = getResourceClass(attr.associate);
      return async param => {
        this.loading = true;
        let queryParam = {};
        if (param !== '') {
          const query = associateClass.queryFilter(new ActiveQuery());
          queryParam = query
            .where({ [associateClass.title() + '-like']: param + '%' })
            .paginate(1, 50).query;
        }
        const list = await associateClass.api().list(queryParam);
        self.associateOptions[attr.name] = list.rows.map(item => {
          return {
            key: item.id,
            value: item[associateClass.title()]
          };
        });
        this.loading = false;
      };
    },
    cancel() {
      this.$emit('cancel');
    },
    async createData() {
      const valid = await this.$refs['dataForm'].validate();
      valid && this.$emit('create', this.model);
    },
    async updateData() {
      const valid = await this.$refs['dataForm'].validate();
      valid && this.$emit('update', this.model);
    }
  }
};
</script>

<style scoped>
.form-footer {
  text-align: right;
}
</style>
