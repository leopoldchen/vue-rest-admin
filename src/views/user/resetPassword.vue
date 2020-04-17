<template>
  <div>
    <h3>Reset Password</h3>
    <el-form>
      <el-form-item>
        <el-input v-model="password" placeholder="New Password" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="passwordConfirm" placeholder="Password Confirmation" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="resetPsw">Submit</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
export default {
  name: 'ResetPassword',
  data() {
    return {
      password: '',
      passwordConfirm: ''
    };
  },
  computed: {
    ...mapGetters({
      api: 'api',
      customData: 'customData'
    })
  },
  methods: {
    ...mapActions({
      setCustomData: 'setCustomData'
    }),
    async resetPsw() {
      if (this.password === '') {
        alert('Password should not be empty');
      }
      if (this.password !== this.passwordConfirm) {
        alert('Passwords are not the same');
      }
      await this.api.update({
        id: this.customData.row.id,
        password: this.password
      });
      await this.setCustomData({});
    }
  }
};
</script>
