<template>
  <div class="content-container pagination-container">
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :current-page="listQuery['page']"
      :page-sizes="[10, 20, 30, 50, 100, 200]"
      :page-size="listQuery['perPage']"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
export default {
  name: 'CRUDPaginate',
  props: {
    listQuery: {
      type: Object,
      required: true
    },
    total: {
      type: Number,
      default: 0
    }
  },
  methods: {
    handleSizeChange(val) {
      return this.$emit('handleSizeChange', val);
    },
    handleCurrentChange(val) {
      return this.$emit('handleCurrentChange', val);
    }
  }
};
</script>
