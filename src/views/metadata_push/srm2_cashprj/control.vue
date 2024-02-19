<script setup lang="ts">
import api from '@/api/modules/metadataPush_srm2Cashprj'

defineOptions({
  name: 'MetadataPushSrm2CashprjsControl',
})

const data = ref({
  loading: false,
  list: [],
})

// api 函数
// 查询队列状态
function queryList() {
  data.value.loading = true
  api.list().then((res: any) => {
    data.value.list = res.data
  })
  data.value.loading = false
}

// mounted
onMounted(() => {
  queryList()
})

// 提交
async function onSubmit() {
  data.value.loading = true
  await api.start()
  queryList()
  data.value.loading = false
}

// 刷新
function onRefeash() {
  queryList()
}
</script>

<template>
  <div>
    <!-- 头 -->
    <PageHeader title="推送收支项目" />
    <!-- 布局 -->
    <PageMain>
      <div>
        <ElButtonGroup class="my-2">
          <ElButton type="primary" @click="onSubmit()">
            新增推送
          </ElButton>
          <ElButton @click="onRefeash()">
            刷新状态
          </ElButton>
        </ElButtonGroup>
        <ElDivider />

        <ElTable :data="data.list" height="100%" stripe border>
          <ElTableColumn prop="id" label="id" width="60" />
          <ElTableColumn prop="name" label="名称" />
          <ElTableColumn prop="status" label="状态" width="180" />
          <ElTableColumn label="操作" width="250" align="center" fixed="right">
            <template #default="scope">
              <ElButton type="text" size="small" plain :loading="data.loading">
                查看日志 id:{{ scope.row.id }}
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </PageMain>
  </div>
</template>

<style lang="scss" scoped>
// 样式
</style>
