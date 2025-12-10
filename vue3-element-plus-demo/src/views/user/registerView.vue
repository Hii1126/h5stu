<template>
  <Nav></Nav>
  <el-form
    ref="ruleFormRef"
    style="max-width: 600px"
    :model="ruleForm"
    :rules="rules"
    label-width="auto"
  >
    <el-form-item label="用户名" prop="name">
      <el-input v-model="ruleForm.name" />
    </el-form-item>
    <el-form-item label="密码" prop="pwd">
      <el-input type="password" v-model="ruleForm.pwd" :suffix-icon="Lock"/>
    </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
      <el-input
        v-model="ruleForm.checkPass"
        type="password"
        autocomplete="off"
        :suffix-icon="Lock"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(ruleFormRef)">
        Create
      </el-button>
      <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

import type { FormInstance, FormRules } from 'element-plus'
import Nav from '@/components/layout/Nav.vue'
import { Lock } from '@element-plus/icons-vue'
import router from '@/router'

interface RuleForm {
  name: string,
  pwd:string
  checkPass:string
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  pwd:'',
  checkPass:''
})

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== ruleForm.pwd) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { pattern: /^[a-z]{3,5}$/, message: '用户名只能以字母开头，长度为3-5位', trigger: 'blur'}
  ],
  pwd:[
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
    { max: 16, message: '密码长度不能大于16位', trigger: 'blur' },
    { pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  checkPass: [{ required: true,validator: validatePass, trigger: 'blur' }]
})


const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      router.push('/')
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}))
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
