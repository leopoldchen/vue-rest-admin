<template>
  <el-table :data="list" border fit highlight-current-row style="width: 100%">
    <el-table-column align="center" label="Key">
      <template slot-scope="scope">
        <span> {{ i18n(scope.row.key) }} </span>
      </template>
    </el-table-column>
    <el-table-column align="center" label="Value">
      <template slot-scope="scope">
        <span> {{ scope.row.value }} </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'CRUDShow',
  props: {
    list: Array
  },
  computed: {
    ...mapGetters({
      resourceClass: 'resourceClass'
    })
  },
  methods: {
    i18n(col) {
      return this.resourceClass.i18n(col);
    }
  }
};
</script>
