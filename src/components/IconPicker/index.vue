<script setup lang="ts">
import { icons } from '@/iconify'

defineOptions({
  name: 'IconPicker',
})

const props = withDefaults(defineProps<{
  modelValue: string
  size?: 'large' | 'default' | 'small'
}>(), {
  modelValue: '',
  size: 'default',
})

const emits = defineEmits<{
  'update:modelValue': [
    value: string,
  ]
}>()

const myValue = ref('')
watch(() => props.modelValue, (value) => {
  myValue.value = value
}, {
  immediate: true,
})

const dialogVisible = ref(false)
const activeName = ref(icons.some(item => item.prefix === myValue.value.split(':')[0]) ? myValue.value.split(':')[0] : icons[0].prefix)
const search = ref('')
const pagination = ref({
  page: 1,
  pageSize: 29,
})

const iconList = computed(() => {
  let iconsFilter = icons.filter((item) => {
    return item.prefix === activeName.value
  })[0].icons
  if (search.value) {
    iconsFilter = iconsFilter.filter((item) => {
      return item.includes(search.value)
    })
  }
  return iconsFilter
})
const currentIconList = computed(() => {
  return iconList.value.slice(
    (pagination.value.page - 1) * pagination.value.pageSize,
    (pagination.value.page - 1) * pagination.value.pageSize + pagination.value.pageSize,
  )
})

function handleTabChange() {
  pagination.value.page = 1
}

const previewIcon = ref('')
const previewIconIndex = ref(0)
const previewIconPosition = computed(() => {
  return [
    previewIconIndex.value < 18 ? 'top' : 'bottom',
    previewIconIndex.value % 6 >= 3 ? 'left' : 'right',
  ].join('-')
})
function showPreviewIcon(iconName: string, index: number) {
  previewIcon.value = iconName
  previewIconIndex.value = index
}
function hidePreviewIcon() {
  previewIcon.value = ''
  previewIconIndex.value = 0
}

function chooseIcon(val: string) {
  myValue.value = val
  emits('update:modelValue', val)
  dialogVisible.value = false
}
function removeIcon() {
  myValue.value = ''
  emits('update:modelValue', '')
  dialogVisible.value = false
}
</script>

<template>
  <div
    class="icon-picker" :class="{
      empty: myValue === '',
      [`icon-picker--${size}`]: true,
    }" @click="dialogVisible = true"
  >
    <SvgIcon :name="myValue !== '' ? myValue : 'ep:plus'" />
  </div>
  <ElDialog v-model="dialogVisible" width="600px" :show-close="true" append-to-body>
    <div class="icon-picker-dialog-body">
      <ElTabs v-model="activeName" tab-position="left" class="demo-tabs" @tab-change="handleTabChange">
        <ElTabPane v-for="item in icons" :key="item.prefix" :name="item.prefix">
          <template #label>
            <div class="icon-label">
              <div class="name">
                {{ item.info.name }}
              </div>
              <div class="total">
                {{ item.info.total }} 个
              </div>
            </div>
          </template>
        </ElTabPane>
      </ElTabs>
      <div class="main-container">
        <div class="search-bar">
          <ElInput v-model="search" size="large" placeholder="搜索..." clearable>
            <template #prefix>
              <SvgIcon name="ep:search" />
            </template>
          </ElInput>
        </div>
        <div class="list-icon">
          <span class="empty list-icon-item" @click="removeIcon">
            <SvgIcon name="ep:delete" :size="28" />
          </span>
          <span v-for="(icon, index) in currentIconList" :key="index" class="list-icon-item" @click="chooseIcon(`${activeName}:${icon}`)" @mouseover="showPreviewIcon(`${activeName}:${icon}`, index + 1)" @mouseout="hidePreviewIcon">
            <SvgIcon :name="`${activeName}:${icon}`" :size="28" />
          </span>
          <div class="list-icon-preview-item" :class="previewIcon && previewIconPosition">
            <SvgIcon :name="previewIcon" :size="108" />
          </div>
        </div>
        <ElPagination v-model:current-page="pagination.page" layout="prev, pager, next" :page-size="pagination.pageSize" :total="iconList.length" :pager-count="5" background />
      </div>
    </div>
  </ElDialog>
</template>

<style lang="scss" scoped>
.icon-picker {
  --icon-picker-size: var(--el-component-size);
  --icon-picker-font-size: var(--el-font-size-large);

  &--small {
    --icon-picker-size: var(--el-component-size-small);
    --icon-picker-font-size: var(--el-font-size-medium);
  }

  &--large {
    --icon-picker-size: var(--el-component-size-large);
    --icon-picker-font-size: var(--el-font-size-extra-large);
  }

  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-picker-size);
  height: var(--icon-picker-size);
  color: var(--el-text-color-regular);
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
  transition: 0.3s;
  font-size: var(--icon-picker-font-size);
  vertical-align: middle;

  &:hover {
    border: 1px solid var(--el-border-color-darker);
  }

  &.empty {
    color: var(--el-text-color-placeholder);
    border: 1px dashed var(--el-border-color);

    &:hover {
      color: var(--el-text-color-regular);
      border: 1px solid var(--el-border-color-darker);
    }
  }
}

.icon-picker-dialog-body {
  display: flex;
  height: 500px;
  margin: calc((var(--el-dialog-padding-primary) + 10px + 30px) * -1) calc(var(--el-dialog-padding-primary) * -1) calc((var(--el-dialog-padding-primary) + 10px) * -1) calc(var(--el-dialog-padding-primary) * -1);

  .el-tabs {
    :deep(.el-tabs__nav-prev),
    :deep(.el-tabs__nav-next) {
      background-image: linear-gradient(to right, transparent, var(--el-fill-color));
    }

    :deep(.el-tabs__header .el-tabs__nav) {
      .el-tabs__active-bar {
        z-index: 0;
        width: 100%;
        background-color: unset;
        background-image: linear-gradient(to right, transparent, var(--el-fill-color));
        border-right: 2px solid var(--el-color-primary);
        transition: 0.3s;
      }

      .el-tabs__item {
        position: relative;
        margin-bottom: -2px;
        height: auto;
        transition: 0.3s;

        &::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background-image: linear-gradient(to right, transparent, var(--el-fill-color));
        }

        .icon-label {
          display: flex;
          flex-direction: column;
          width: 120px;
          text-align: left;
          line-height: 20px;
          padding: 15px 0;

          .name {
            font-size: 16px;
            margin-bottom: 2px;
            white-space: normal;
            word-break: initial;
          }

          .total {
            font-size: 12px;
          }
        }
      }
    }
  }

  .main-container {
    flex: 1;
    margin-right: 10px;

    .search-bar {
      margin: 0 75px;

      .el-input {
        margin-top: 20px;
      }
    }

    .list-icon {
      position: relative;
      margin: 15px 0;
      min-height: 160px;

      .list-icon-item {
        display: inline-flex;
        margin: 5px;
        box-sizing: content-box;
        padding: 15px;
        cursor: pointer;
        border: 1px solid var(--el-border-color);
        transition: var(--el-transition-border);

        &:not(.empty):hover {
          border-color: var(--el-border-color-darker);
          background-color: var(--el-fill-color);
          color: var(--el-color-primary);
          transition: background-color 0.3s, var(--el-transition-border), var(--el-transition-color);
        }

        &.empty {
          border-color: transparent;
          color: var(--el-text-color-placeholder);
          transition: var(--el-transition-color);

          &:hover {
            color: var(--el-text-color-disabled);
          }
        }
      }

      .list-icon-preview-item {
        display: none;
        position: absolute;
        box-sizing: content-box;
        padding: 10px;
        border: 1px solid var(--el-border-color-darker);
        background: var(--el-fill-color);
        color: var(--el-color-primary);

        &.top-left {
          display: inline-flex;
          top: 5px;
          left: 5px;
        }

        &.top-right {
          display: inline-flex;
          top: 5px;
          right: 6px;
        }

        &.bottom-left {
          display: inline-flex;
          bottom: 5px;
          left: 5px;
        }

        &.bottom-right {
          display: inline-flex;
          bottom: 5px;
          right: 6px;
        }
      }
    }

    .el-pagination {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
