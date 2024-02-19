<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import FormMode from './components/FormMode/index.vue'
import eventBus from '@/utils/eventBus'
import api from '@/api/modules/metadataPush_srm2Items'
import useSettingsStore from '@/store/modules/settings'

defineOptions({
  name: 'MetadataPushSrm2ItemsList',
})

const router = useRouter()
const { pagination, getParams, onSizeChange, onCurrentChange, onSortChange } = usePagination()
const tabbar = useTabbar()
const settingsStore = useSettingsStore()

const data = ref({
  loading: false,
  // 表格是否自适应高度
  tableAutoHeight: false,
  /**
   * 详情展示模式
   * router 路由跳转
   * dialog 对话框
   * drawer 抽屉
   */
  formMode: 'router' as 'router' | 'dialog' | 'drawer',
  // 详情
  formModeProps: {
    visible: false,
    id: '',
  },
  // 搜索
  search: {
    title: '',
  },
  searchFold: true,
  // 批量操作
  batch: {
    enable: true,
    selectionDataList: [],
  },
  // 列表数据
  dataList: [],
})

onMounted(() => {
  getDataList()
  if (data.value.formMode === 'router') {
    eventBus.on('get-data-list', () => {
      getDataList()
    })
  }
})

onBeforeUnmount(() => {
  if (data.value.formMode === 'router') {
    eventBus.off('get-data-list')
  }
})

function getDataList() {
  data.value.loading = true
  const params = {
    ...getParams(),
    ...(data.value.search.title && { title: data.value.search.title }),
  }
  api.list(params).then((res: any) => {
    data.value.loading = false
    data.value.dataList = res.data.list
    pagination.value.total = res.data.total
  })
}

// 每页数量切换
function sizeChange(size: number) {
  onSizeChange(size).then(() => getDataList())
}

// 当前页码切换（翻页）
function currentChange(page = 1) {
  onCurrentChange(page).then(() => getDataList())
}

// 字段排序
function sortChange({ prop, order }: { prop: string, order: string }) {
  onSortChange(prop, order).then(() => getDataList())
}

function onCreate() {
  if (data.value.formMode === 'router') {
    if (settingsStore.settings.tabbar.enable && settingsStore.settings.tabbar.mergeTabsBy !== 'activeMenu') {
      tabbar.open({
        name: 'srm2-itemsCreate',
      })
    }
    else {
      router.push({
        name: 'srm2-itemsCreate',
      })
    }
  }
  else {
    data.value.formModeProps.id = ''
    data.value.formModeProps.visible = true
  }
}

function onEdit(row: any) {
  if (data.value.formMode === 'router') {
    if (settingsStore.settings.tabbar.enable && settingsStore.settings.tabbar.mergeTabsBy !== 'activeMenu') {
      tabbar.open({
        name: 'srm2-itemsEdit',
        params: {
          id: row.id,
        },
      })
    }
    else {
      router.push({
        name: 'srm2-itemsEdit',
        params: {
          id: row.id,
        },
      })
    }
  }
  else {
    data.value.formModeProps.id = row.id
    data.value.formModeProps.visible = true
  }
}

function onDel(row: any) {
  ElMessageBox.confirm(`确认删除「${row.title}」吗？`, '确认信息').then(() => {
    api.delete(row.id).then(() => {
      getDataList()
      ElMessage.success({
        message: '模拟删除成功',
        center: true,
      })
    })
  }).catch(() => {})
}
</script>

<template>
  <div :class="{ 'absolute-container': data.tableAutoHeight }">
    <PageHeader title="物料推送历史" />
    <PageMain>
      <SearchBar :fold="data.searchFold" :show-toggle="false">
        <template #default="{ fold }">
          <ElForm :model="data.search" size="default" label-width="100px" inline-message inline class="search-form">
            <ElFormItem label="标题">
              <ElInput v-model="data.search.title" placeholder="请输入标题，支持模糊查询" clearable @keydown.enter="currentChange()" @clear="currentChange()" />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" @click="currentChange()">
                <template #icon>
                  <SvgIcon name="ep:search" />
                </template>
                筛选
              </ElButton>
              <ElButton link disabled @click="data.searchFold = !fold">
                <template #icon>
                  <SvgIcon :name="fold ? 'ep:caret-bottom' : 'ep:caret-top' " />
                </template>
                {{ fold ? '展开' : '收起' }}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </template>
      </SearchBar>
      <ElDivider border-style="dashed" />
      <ElSpace wrap>
        <ElButton type="primary" size="default" @click="onCreate">
          <template #icon>
            <SvgIcon name="ep:plus" />
          </template>
          新增推送SRM物料
        </ElButton>
        <ElButton v-if="data.batch.enable" size="default" :disabled="!data.batch.selectionDataList.length">
          单个批量操作按钮
        </ElButton>
        <ElButtonGroup v-if="data.batch.enable">
          <ElButton size="default" :disabled="!data.batch.selectionDataList.length">
            批量操作按钮组1
          </ElButton>
          <ElButton size="default" :disabled="!data.batch.selectionDataList.length">
            批量操作按钮组2
          </ElButton>
        </ElButtonGroup>
      </ElSpace>
      <ElTable v-loading="data.loading" class="my-4" :data="data.dataList" stripe highlight-current-row border height="100%" @sort-change="sortChange" @selection-change="data.batch.selectionDataList = $event">
        <ElTableColumn v-if="data.batch.enable" type="selection" align="center" fixed />
        <ElTableColumn prop="title" label="标题" />
        <ElTableColumn label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <ElButton type="primary" size="small" plain @click="onEdit(scope.row)">
              编辑
            </ElButton>
            <ElButton type="danger" size="small" plain @click="onDel(scope.row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination :current-page="pagination.page" :total="pagination.total" :page-size="pagination.size" :page-sizes="pagination.sizes" :layout="pagination.layout" :hide-on-single-page="false" class="pagination" background @size-change="sizeChange" @current-change="currentChange" />
    </PageMain>
    <FormMode v-if="data.formMode === 'dialog' || data.formMode === 'drawer'" :id="data.formModeProps.id" v-model="data.formModeProps.visible" :mode="data.formMode" @success="getDataList" />
  </div>
</template>

<style lang="scss" scoped>
.absolute-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    margin-bottom: 0;
  }

  .page-main {
    flex: 1;
    overflow: auto;

    :deep(.main-container) {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
    }
  }
}

.page-main {
  .search-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    margin-bottom: -18px;

    :deep(.el-form-item) {
      grid-column: auto / span 1;

      &:last-child {
        grid-column-end: -1;

        .el-form-item__content {
          justify-content: flex-end;
        }
      }
    }
  }

  .el-divider {
    margin-inline: -20px;
    width: calc(100% + 40px);
  }
}
</style>
