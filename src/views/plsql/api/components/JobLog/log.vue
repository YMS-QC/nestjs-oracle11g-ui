<script setup lang="ts">
import type { DetailFormProps } from '../../types'
import api from '@/api/modules/plsql_api'

const props = withDefaults(
  defineProps<DetailFormProps>(),
  {
    id: '',
  },
)

const loading = ref(false)
const data = ref({ logs: [], count: 0 })

onMounted(() => {
  if (props.id !== '') {
    getInfo()
  }
})

function getInfo() {
  loading.value = true
  api.getJobLogs(props.id).then((res: any) => {
    data.value.logs = res.data.logs || []
    data.value.count = res.data.count || 0
    loading.value = false
  })
}
</script>

<template>
  <ElText v-if="data.count > 0" v-loading="loading">
    <p v-for="(log, index) in data.logs" :key="index">
      {{ log }}
    </p>
  </ElText>
</template>

<style lang="scss" scoped>
// scss
</style>
