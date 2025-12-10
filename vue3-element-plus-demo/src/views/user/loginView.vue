<template>
  <Nav></Nav>
  <el-form
    ref="loginFormRef"
    style="max-width: 600px"
    :model="loginForm"
    label-width="auto"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="loginForm.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input type="password" v-model="loginForm.password" :suffix-icon="Lock"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(loginFormRef)">
        登录
      </el-button>
      <el-button @click="resetForm(loginFormRef)">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import Nav from '@/components/layout/Nav.vue'
import { Lock } from '@element-plus/icons-vue'
import router from '@/router'
import { useUserLoginStore } from '@/stores/userLogin'
import { ElMessage } from 'element-plus'

interface LoginForm {
  username: string,
  password: string
}

const loginFormRef = ref<FormInstance>()
const loginForm = reactive<LoginForm>({
  username: '',
  password: ''
})

const userStore = useUserLoginStore()

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('登录信息:', loginForm)
      if (loginForm.username === 'admin' && loginForm.password === 'admin'||loginForm.username === 'tom' && loginForm.password === 'tom') {
        // 登录成功，保存用户信息到Pinia
        userStore.login(loginForm.username)
        ElMessage.success('登录成功!')
        router.push('/')
      } else {
        ElMessage.error('用户名或密码错误!')
      }
    } else {
      console.log('表单验证失败!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>
<style scoped>
    .el-form{
        border:1px solid #f0f0f0;
        margin:20px auto;
        box-sizing: border-box;
        padding:20px;
        border-radius: 5px;
    }
</style>