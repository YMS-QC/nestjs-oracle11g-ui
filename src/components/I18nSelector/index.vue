<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { localesName } from '@/locales'
import useSettingsStore from '@/store/modules/settings'
import { i18nTitleInjectionKey } from '@/utils/injectionKeys'

defineOptions({
  name: 'I18nSelector',
})

const { locale } = useI18n()
const route = useRoute()

const settingsStore = useSettingsStore()

const langItems = computed(() => {
  return Object.keys(localesName).map((item: any) => ({
    label: localesName[item],
    disabled: settingsStore.lang === item,
    handle: () => setLanguage(item),
  }))
})

const generateI18nTitle = inject(i18nTitleInjectionKey, Function, true)

function setLanguage(name: string) {
  locale.value = name
  settingsStore.setDefaultLang(name)
  if (settingsStore.settings.app.routeBaseOn !== 'filesystem') {
    if (route.meta.breadcrumbNeste?.at(-1)?.i18n || route.meta.breadcrumbNeste?.at(-1)?.title) {
      settingsStore.setTitle(generateI18nTitle(route.meta.breadcrumbNeste?.at(-1)?.i18n, route.meta.breadcrumbNeste?.at(-1)?.title))
    }
    else {
      settingsStore.setTitle(generateI18nTitle(route.meta.i18n, route.meta.title))
    }
  }
  else {
    if (route.meta.i18n || route.meta.title) {
      settingsStore.setTitle(generateI18nTitle(route.meta.i18n, route.meta.title))
    }
  }
}
</script>

<template>
  <HDropdownMenu v-if="settingsStore.settings.toolbar.enableI18n" :items="[langItems]">
    <slot />
  </HDropdownMenu>
</template>
