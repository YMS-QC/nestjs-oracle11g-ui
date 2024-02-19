<script setup lang="ts">
import eruda from 'eruda'
import VConsole from 'vconsole'
import { useI18n } from 'vue-i18n'
import hotkeys from 'hotkeys-js'
import { i18nTitleInjectionKey } from './utils/injectionKeys'
import eventBus from './utils/eventBus'
import Provider from './ui-provider/index.vue'
import useSettingsStore from '@/store/modules/settings'
import useMenuStore from '@/store/modules/menu'

const routeInfo = useRoute()

const settingsStore = useSettingsStore()
const menuStore = useMenuStore()
const { auth } = useAuth()

// 侧边栏主导航当前实际宽度
const mainSidebarActualWidth = computed(() => {
  let actualWidth = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-main-sidebar-width'))
  if (settingsStore.settings.menu.menuMode === 'single' || (['head', 'only-head'].includes(settingsStore.settings.menu.menuMode) && settingsStore.mode !== 'mobile')) {
    actualWidth = 0
  }
  return `${actualWidth}px`
})

// 侧边栏次导航当前实际宽度
const subSidebarActualWidth = computed(() => {
  let actualWidth = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-sub-sidebar-width'))
  if (settingsStore.settings.menu.subMenuCollapse && settingsStore.mode !== 'mobile') {
    actualWidth = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--g-sub-sidebar-collapse-width'))
  }
  if (['only-side', 'only-head'].includes(settingsStore.settings.menu.menuMode) && settingsStore.mode !== 'mobile') {
    actualWidth = 0
  }
  if (
    settingsStore.settings.menu.subMenuOnlyOneHide
    && menuStore.sidebarMenus.length === 1
    && (
      !menuStore.sidebarMenus[0].children
      || menuStore.sidebarMenus[0]?.children.every(item => item.meta?.sidebar === false)
    )
  ) {
    actualWidth = 0
  }
  return `${actualWidth}px`
})

// 设置网页 title
watch([
  () => settingsStore.settings.app.enableDynamicTitle,
  () => settingsStore.title,
  () => settingsStore.customTitleList,
], () => {
  if (settingsStore.settings.app.enableDynamicTitle && settingsStore.title) {
    const title = settingsStore.customTitleList.find(item => item.fullPath === routeInfo.fullPath)?.title
      || (
        settingsStore.settings.app.routeBaseOn !== 'filesystem'
          ? routeInfo.meta.breadcrumbNeste?.at(-1)?.i18n
            ? generateI18nTitle(routeInfo.meta.breadcrumbNeste?.at(-1)?.i18n, settingsStore.title)
            : generateI18nTitle(routeInfo.meta.i18n, settingsStore.title)
          : generateI18nTitle(routeInfo.meta.i18n, settingsStore.title)
      )
    document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`
  }
  else {
    document.title = import.meta.env.VITE_APP_TITLE
  }
}, {
  immediate: true,
  deep: true,
})

onMounted(() => {
  settingsStore.setMode(document.documentElement.clientWidth)
  window.onresize = () => {
    settingsStore.setMode(document.documentElement.clientWidth)
  }
  hotkeys('alt+i', () => {
    eventBus.emit('global-system-info-toggle')
  })
})

const { t, te } = useI18n()
provide(i18nTitleInjectionKey, generateI18nTitle)
function generateI18nTitle(key: string | undefined, defaultTitle: string | (() => any) = t('route.undefined')) {
  return (settingsStore.settings.toolbar.enableI18n && !!key && te(key))
    ? t(key)
    : typeof defaultTitle === 'function'
      ? defaultTitle()
      : defaultTitle
}

import.meta.env.VITE_APP_DEBUG_TOOL === 'eruda' && eruda.init()
import.meta.env.VITE_APP_DEBUG_TOOL === 'vconsole' && new VConsole()
</script>

<template>
  <Provider>
    <RouterView
      v-slot="{ Component, route }"
      :style="{
        '--g-main-sidebar-actual-width': mainSidebarActualWidth,
        '--g-sub-sidebar-actual-width': subSidebarActualWidth,
      }"
    >
      <component :is="Component" v-if="auth(route.meta.auth ?? '')" />
      <NotAllowed v-else />
    </RouterView>
    <SystemInfo />
  </Provider>
</template>
