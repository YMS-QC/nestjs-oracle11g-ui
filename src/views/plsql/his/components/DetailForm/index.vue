<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { DetailFormProps } from '../../types'
import api from '@/api/modules/plsql_his'

const props = withDefaults(
  defineProps<DetailFormProps>(),
  {
    id: '',
    requestBody: '',
    responseBody: '',
  },
)

const loading = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  id: props.id,
  requestBody: '',
  responseBody: '',
})

// 查看请求报文不需要校验
const formRules = ref<FormRules>({
  // title: [
  //   { required: true, message: '请输入标题', trigger: 'blur' },
  // ],
})

onMounted(() => {
  if (form.value.id !== '') {
    getInfo()
  }
})

function getInfo() {
  loading.value = true
  api.requestInfo(form.value.id).then((res: any) => {
    loading.value = false
    form.value.requestBody = res.data.requestBody
    form.value.responseBody = res.data.responseBody
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
      <ElFormItem label="请求报文" prop="title">
        <ElInput v-model="form.requestBody" autosize type="textarea" placeholder="请输入标题" />
      </ElFormItem>
      <ElFormItem label="响应报文" prop="title">
        <ElInput v-model="form.responseBody" autosize type="textarea" placeholder="请输入标题" />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style lang="scss" scoped>
// scss
</style>
