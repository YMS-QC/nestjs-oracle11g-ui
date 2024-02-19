<script setup lang="ts">
import { locales } from './index'
import useSettingsStore from '@/store/modules/settings'

const settingsStore = useSettingsStore()
</script>

<template>
  <ElConfigProvider :locale="locales[settingsStore.lang]" :button="{ autoInsertSpace: true }">
    <slot />
  </ElConfigProvider>
</template>
