<script setup lang="ts">
import type { DetailFormProps } from '../../types'
import DetailForm from '../DetailForm/index.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    mode: 'dialog' | 'drawer'
  } & DetailFormProps>(),
  {
    modelValue: false,
  },
)

const emits = defineEmits<{
  'update:modelValue': [
    value: boolean,
  ]
  'success': []
}>()

const formRef = ref()

const myVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  },
})

const title = computed(() => props.id === '' ? '新增PLSQL接口' : '编辑PLSQL接口')

function onSubmit() {
  // submit() 为组件内部方法
  formRef.value.submit().then(() => {
    emits('success')
    onCancel()
  })
}

function onCancel() {
  myVisible.value = false
}
</script>

<template>
  <div>
    <ElDialog v-if="props.mode === 'dialog'" v-model="myVisible" :title="title" width="600px" :close-on-click-modal="false" append-to-body destroy-on-close>
      <DetailForm ref="formRef" v-bind="props" />
      <template #footer>
        <ElButton size="large" @click="onCancel">
          取消
        </ElButton>
        <ElButton type="primary" size="large" @click="onSubmit">
          确定
        </ElButton>
      </template>
    </ElDialog>
    <ElDrawer v-else-if="props.mode === 'drawer'" v-model="myVisible" :title="title" size="600px" :close-on-click-modal="false" destroy-on-close>
      <DetailForm ref="formRef" v-bind="props" />
      <template #footer>
        <ElButton size="large" @click="onCancel">
          取消
        </ElButton>
        <ElButton type="primary" size="large" @click="onSubmit">
          确定
        </ElButton>
      </template>
    </ElDrawer>
  </div>
</template>
