<template>
  <div v-if="haveSearchParams" class="filter-container">
    <div v-for="filter in quries" :key="filter.name" style="margin: 6px;">
      <el-button
        icon="el-icon-minus"
        size="mini"
        circle
        @click="removeFilter(filter.name)"
      />
      <span style="width: 120px; display: inline-block">
        {{ i18n(filter.name) }}
      </span>
      <el-select v-model="filter.op" style="margin: 0px 10px">
        <el-option
          v-for="item in filter.options"
          :key="item.key"
          :label="item.value"
          :value="item.key"
        />
      </el-select>
      <el-date-picker
        v-if="filter.type == 'Date'"
        v-model="filter.value"
        style="width: 300px"
        type="datetime"
      />
      <el-input
        v-else
        v-model="filter.value"
        style="width: 300px"
        size="medium"
      />
    </div>
    <el-button icon="el-icon-search" type="primary" @click="handleSearch()">
      {{ $t('search') }}
    </el-button>
  </div>
</template>

<script>
import _ from 'lodash';
import { getQueryOps, parseQuery } from './queryOps';
import { mapGetters } from 'vuex';
import { getResourceClass } from '@/resources';
import { ActiveQuery } from '@/utils/query';

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
    };
  },
  computed: {
    ...mapGetters({
      resourceClass: 'resourceClass'
    }),
    haveSearchParams() {
      return this.searchParams.length > 0;
    }
  },
  watch: {
    searchParams(data) {
      this.syncSearchParams(data);
    }
  },
  created() {
    this.syncSearchParams();
  },
  methods: {
    i18n(col) {
      return this.resourceClass.i18n(col);
    },
    syncSearchParams(data) {
      data = data || this.searchParams;
      const attrs = this.resourceClass.attributes();
      const newQueries = _.cloneDeep(this.quries);
      for (const filter of data) {
        if (!newQueries[filter]) {
          const index = _.findIndex(
            attrs,
            attr => attr.name === filter || attr.alias === filter
          );
          const attr = attrs[index];
          const type = attr.associate ? 'String' : attr.type || 'String';
          const options = getQueryOps(type);
          let q = filter;
          if (attr.associate) {
            const associateField =
              attr.associateField || getResourceClass(attr.associate).title();
            if (attr.associateAs) {
              q = ActiveQuery.associateKey(attr.associateAs, associateField);
            } else {
              q = ActiveQuery.associateKey(
                _.snakeCase(attr.associate),
                associateField
              );
            }
          }
          newQueries[filter] = {
            name: filter,
            op: 'eq',
            value: '',
            q,
            type,
            options
          };
        }
      }
      this.quries = newQueries;
    },
    removeFilter(filter) {
      this.$emit('removeFilter', filter);
      this.quries = _.omit(this.quries, filter);
      this.handleSearch();
    },
    handleSearch() {
      const q = {};
      for (const filter in this.quries) {
        const data = this.quries[filter];
        if (data.value !== '') _.merge(q, parseQuery(data));
      }
      this.$emit('handleSearch', q);
    }
  }
};
</script>

<style>
.filter-container {
  background-color: #eee;
  margin: 10px 0px;
  padding: 10px;
}
</style>
