<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import FormMode from './components/FormMode/index.vue'
import JobLog from './components/JobLog/index.vue'
import eventBus from '@/utils/eventBus'
import api from '@/api/modules/plsql_api'
import useSettingsStore from '@/store/modules/settings'

defineOptions({
  name: 'PlsqlRegistQueueControl',
})

// const router = useRouter()
// const tabbar = useTabbar()
// const settingsStore = useSettingsStore()

const data = ref({
  /**
   * 详情展示模式
   * router 路由跳转
   * dialog 对话框
   * drawer 抽屉
   */
  formMode: 'dialog' as 'router' | 'dialog' | 'drawer',
  loading: false,
  list: [],
  isPaused: false,
  // 详情
  formModeProps: {
    visible: false,
    id: '',
  },
})

// api 函数
// 查询队列状态
function queryList() {
  data.value.loading = true
  api.listJob().then((res: any) => {
    data.value.list = res.data
  })
  api.queueStatus().then(res => data.value.isPaused = res.data.isPaused)

  data.value.loading = false
}

// mounted
onMounted(() => {
  queryList()
})

// 恢复
async function onResume() {
  data.value.loading = true
  await api.resumeQueue()
  queryList()
  data.value.loading = false
}

// 恢复
async function onPause() {
  data.value.loading = true
  await api.pauseQueue()
  queryList()
  data.value.loading = false
}

// 刷新
function onRefeash() {
  queryList()
}

// 展示日志
function onShowLog(row: any) {
  data.value.formModeProps.id = row.id
  data.value.formModeProps.visible = true
  // if (data.value.formMode === 'router') {
  //   if (settingsStore.settings.tabbar.enable && settingsStore.settings.tabbar.mergeTabsBy !== 'activeMenu') {
  //     tabbar.open({
  //       name: 'plsqlEdit',
  //       params: {
  //         id: row.id,
  //       },
  //     })
  //   }
  //   else {
  //     router.push({
  //       name: 'plsqlEdit',
  //       params: {
  //         id: row.id,
  //       },
  //     })
  //   }
  // }
  // else {
  //   data.value.formModeProps.id = row.id
  //   data.value.formModeProps.visible = true
  // }
}
</script>

<template>
  <div>
    <!-- 头 -->
    <PageHeader title="接口注册队列" />
    <!-- 布局 -->
    <PageMain>
      <div>
        <ElButtonGroup class="my-2">
          <ElButton v-if="data.isPaused" type="primary" :loading="data.loading" @click="onResume()">
            重启
          </ElButton>
          <ElButton v-else type="danger" :loading="data.loading" @click="onPause()">
            暂停
          </ElButton>
          <ElButton @click="onRefeash()">
            刷新
          </ElButton>
        </ElButtonGroup>
        <ElDivider />

        <ElTable :data="data.list" height="100%" stripe border>
          <ElTableColumn prop="id" label="id" width="60" />
          <ElTableColumn prop="name" label="名称" />
          <ElTableColumn prop="status" label="状态" width="180" />
          <ElTableColumn label="操作" width="250" align="center" fixed="right">
            <template #default="scope">
              <ElButton type="text" size="small" plain :loading="data.loading" @click="onShowLog(scope.row)">
                查看日志 id:{{ scope.row.id }}
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </PageMain>
    <JobLog v-if="data.formMode === 'dialog' || data.formMode === 'drawer'" :id="data.formModeProps.id" v-model="data.formModeProps.visible" :mode="data.formMode" @success="queryList" />
  </div>
</template>

<style lang="scss" scoped>
// 样式
</style>
