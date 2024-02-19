<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { DetailFormProps } from '../../types'
import api from '@/api/modules/plsql_api'

const props = withDefaults(
  defineProps<DetailFormProps>(),
  {
    id: '',
  },
)

const loading = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  id: props.id,
  bizName: '',
  packageName: '',
  procedureName: '',
  remark: '',
})
const formRules = ref<FormRules>({
  bizName: [
    { required: true, message: '请输入业务名称', trigger: 'blur' },
  ],
  packageName: [
    { required: true, message: '请输入程序包名称', trigger: 'blur' },
  ],
  procedureName: [
    { required: true, message: '请输入存储过程名称', trigger: 'blur' },
  ],
})

onMounted(() => {
  if (form.value.id !== '') {
    getInfo()
  }
})

function getInfo() {
  loading.value = true
  api.detail(form.value.id).then((res: any) => {
    loading.value = false
    form.value.bizName = res.data.bizName
    form.value.remark = res.data.remark
    form.value.packageName = res.data.origPackageName
    form.value.procedureName = res.data.origObjectName
  })
}

defineExpose({
  submit() {
    return new Promise<void>((resolve) => {
      if (form.value.id === '') {
        formRef.value && formRef.value.validate((valid) => {
          if (valid) {
            api.create(form.value).then(() => {
              ElMessage.success({
                message: '模拟新增成功',
                center: true,
              })
              resolve()
            })
          }
        })
      }
      else {
        formRef.value && formRef.value.validate((valid) => {
          if (valid) {
            api.edit(form.value).then(() => {
              ElMessage.success({
                message: '模拟编辑成功',
                center: true,
              })
              resolve()
            })
          }
        })
      }
    })
  },
})
</script>

<template>
  <div v-loading="loading">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-width="120px" label-suffix="：">
      <ElFormItem label="业务名称" prop="bizName">
        <ElInput v-model="form.bizName" placeholder="请输入业务名称" />
      </ElFormItem>
      <ElFormItem label="程序包名" prop="packageName">
        <ElInput v-model="form.packageName" placeholder="请输入程序包名" :disabled="form.id !== ''" />
      </ElFormItem>
      <ElFormItem label="存储过程名" prop="procedureName">
        <ElInput v-model="form.procedureName" placeholder="存储过程名称" :disabled="form.id !== ''" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style lang="scss" scoped>
// scss
</style>
