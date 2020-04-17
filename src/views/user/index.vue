<template>
  <div>
    <base-crud resource="User" />
    <el-dialog :visible.sync="customData.showResetPasswordDialog">
      <reset-password />
    </el-dialog>
  </div>
</template>

<script>
import BaseCRUD from '@/components/BaseCRUD';
import ResetPassword from './resetPassword';
import { mapGetters } from 'vuex';

export default {
  components: {
    'base-crud': BaseCRUD,
    'reset-password': ResetPassword
  },
  computed: {
    ...mapGetters({
      customData: 'customData'
    })
  }
};
</script>
