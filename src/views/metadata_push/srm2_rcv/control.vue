<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { stringify } from 'qs'
import { defaultValue } from '../default_value'
import api from '@/api/modules/metadataPush_srm2Rcv'

defineOptions({
  name: 'MetadataPushSrm2RcvControl',
})

const loading = ref(false)

const queues = ref(
  [],

)

// 参数Form相关

const profileFormRef = ref<FormInstance>()

const profileForm = ref(defaultValue.profile)

const profileRules = ref<FormRules>({
  lookbackDays: [
    { validator: validateLookbackDays, trigger: 'blur' },

  ],
  sleepSeconds: [
    { validator: validateSleepSeconds, trigger: 'blur' },
  ],

})

function validateLookbackDays(rule: any, value: any, callback: any) {
  if (value === '') {
    callback(new Error('请填写回溯天数'))
  }

  const intVal = Number.parseInt(value)

  if (!intVal || stringify(intVal) !== stringify(value)) {
    callback(new Error('请填写有效的回溯天数'))
  }

  if (!(intVal >= 1 && intVal <= 1000)) {
    callback(new Error('回溯天数需要在1-1000天之间'))
  }

  callback()
}

function validateSleepSeconds(rule: any, value: any, callback: any) {
  if (value === '') {
    callback(new Error('请填写间隔时间(s)'))
  }

  const intVal = Number.parseInt(value)

  if (!intVal || stringify(intVal) !== stringify(value)) {
    callback(new Error('请填写有效的时间间隔'))
  }

  if (!(intVal >= 30)) {
    callback(new Error('时间间隔需要大于30s'))
  }

  callback()
}

// 日历快捷选项
const shortcuts = [
  {
    text: '上周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '上个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '上三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

// 提交配置文件
// function handleSubmit() {
//   // eslint-disable-next-line no-alert
//   alert('submitted!')
// }

// api 函数
// 查询队列状态

//
function queryData() {
  api.queueStatus().then((res: any) => {
    queues.value = res.data
  })
  api.profile().then((res: any) => {
    profileForm.value = { ...defaultValue.profile, ...res.data }
  })
}

// mounted
onMounted(() => {
  loading.value = true
  queryData()
  loading.value = false
})

// handler
async function handleStart() {
  profileFormRef.value && profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      await api.start(profileForm.value)
      await queryData()
      loading.value = false
    }
  })
}
async function handleStop() {
  loading.value = true
  await api.stop()
  await queryData()
  loading.value = false
}

async function handleRefeash() {
  loading.value = true
  await queryData()
  loading.value = false
}
</script>

<template>
  <div>
    <!-- 头 -->
    <PageHeader title="推送物料凭证（接收事务）" />
    <!-- 布局 -->
    <PageMain>
      <ElForm ref="profileFormRef" :model="profileForm" :rules="profileRules">
        <!-- 按钮 -->
        <ElButtonGroup>
          <ElButton size="default" type="primary" @click.prevent="handleStart">
            重启
          </ElButton>
          <ElButton size="default" type="primary" @click.prevent="handleRefeash">
            刷新
          </ElButton>
          <ElButton size="default" type="danger" @click.prevent="handleStop">
            暂停
          </ElButton>
        </ElButtonGroup>
        <ElDivider />
        <!-- 参数面板 -->

        <div class="mx-2 w-full md:w-[80%]">
          <ElFormItem prop="enableDateRange" class="col-span-2">
            <ElSwitch
              v-model="profileForm.enableDateRange"
              active-text="设置固定时间范围"
              inactive-text="设置扫描回溯天数"
            />
          </ElFormItem>
          <div v-if="profileForm.enableDateRange" class="v md:flex-col-start col-span-1 mb-2 w-full md:flex">
            <ElFormItem prop="dateFrom">
              <ElDatePicker
                v-model="profileForm.dateFrom"
                type="datetime"
                unlink-panels
                placeholder="开始时间"
                :shortcuts="shortcuts"
                clearable
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </ElFormItem>
            <span class="hidden md:mx-6px md:block md:pt-1">至</span>
            <ElFormItem prop="dateTo">
              <ElDatePicker
                v-model="profileForm.dateTo"
                type="datetime"
                unlink-panels
                placeholder="默认至今"
                :shortcuts="shortcuts"
                clearable
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </ElFormItem>
          </div>
          <div v-else class="md:flex-col-start col-span-1 mb-2 w-full md:flex">
            <ElFormItem prop="lookbackDays" class="w-full">
              <ElInput v-model.number="profileForm.lookbackDays" type="text" tabindex="1" />
            </ElFormItem>
          </div>
          <ElText class="col-span-2 my-2">
            扫描间隔时间(s)
          </ElText>
          <ElFormItem prop="sleepSeconds" class="col-span-1 mb-4">
            <ElInput v-model.number="profileForm.sleepSeconds" type="text" tabindex="1" />
          </ElFormItem>
          <ElText class="col-span-2 my-2">
            单次最大扫描行数
          </ElText>
          <ElFormItem prop="maxRowNumber" class="col-span-1 mb-4">
            <ElInput v-model.number="profileForm.maxRowNumber" type="text" tabindex="1" />
          </ElFormItem>
          <ElText class="col-span-2 my-2">
            单次最大传输行数
          </ElText>
          <ElFormItem prop="transportRowLimit" class="col-span-1 mb-4">
            <ElInput v-model.number="profileForm.transportRowLimit" type="text" tabindex="1" />
          </ElFormItem>
          <div class="col-span-1 mb-4" />
        </div>
        <div class="w-full md:w-[80%]">
          <ElTable :data="queues" height="100%" stripe>
            <ElTableColumn prop="name" label="步骤" />
            <ElTableColumn prop="isPause" label="状态" width="180">
              <template #default="scope">
                <span>{{ scope.row.isPaused ? '暂停' : '运行' }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="activeCount" label="运行中" width="180" />
            <ElTableColumn prop="waitingCount" label="等待中" width="180" />
          </ElTable>
        </div>
      </ElForm>
    </PageMain>
  </div>
</template>

<style lang="scss" scoped>
// 样式
</style>
