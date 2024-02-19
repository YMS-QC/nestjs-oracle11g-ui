<script setup lang="ts">
import type { DetailFormProps } from '../../types'
import Log from './log.vue'

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

// const formRef = ref()

const myVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  },
})

// const title = computed(() => props.id === '' ? '新增PLSQL接口' : '编辑PLSQL接口')
const title = '查看日志'

// function onSubmit() {
//   // submit() 为组件内部方法
//   formRef.value.submit().then(() => {
//     emits('success')
//     onCancel()
//   })
// }

function onCancel() {
  myVisible.value = false
}
</script>

<template>
  <div>
    <ElDialog v-if="props.mode === 'dialog'" v-model="myVisible" :title="title" width="600px" :close-on-click-modal="false" append-to-body destroy-on-close>
      <Log v-bind="props" />
      <template #footer>
        <ElButton size="large" @click="onCancel">
          关闭
        </ElButton>
      </template>
    </ElDialog>
    <ElDrawer v-else-if="props.mode === 'drawer'" v-model="myVisible" :title="title" size="600px" :close-on-click-modal="false" destroy-on-close>
      <Log v-bind="props" />
      <template #footer>
        <ElButton size="large" @click="onCancel">
          关闭
        </ElButton>
      </template>
    </ElDrawer>
  </div>
</template>
