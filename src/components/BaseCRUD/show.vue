<template>
  <el-table :data="list" border fit highlight-current-row style="width: 100%">
    <el-table-column align="center" label="Key">
      <template slot-scope="scope">
        <span> {{scope.row.key}} </span>
      </template>
    </el-table-column>
    <el-table-column align="center" label="Value">
      <template slot-scope="scope">
        <span> {{scope.row.value}} </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'CRUDShow',
  props: {
    list: Array
  }
}
</script>
