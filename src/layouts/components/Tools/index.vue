<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useFullscreen } from '@vueuse/core'
import Notification from './Notification/index.vue'
import eventBus from '@/utils/eventBus'
import useSettingsStore from '@/store/modules/settings'
import useUserStore from '@/store/modules/user'
import useNotificationStore from '@/store/modules/notification'
import { i18nTitleInjectionKey } from '@/utils/injectionKeys'

defineOptions({
  name: 'Tools',
})

const router = useRouter()

const settingsStore = useSettingsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

notificationStore.init()

const { t } = useI18n()

const generateI18nTitle = inject(i18nTitleInjectionKey, Function, true)

const mainPage = useMainPage()
const { isFullscreen, toggle } = useFullscreen()

function toggleColorScheme(event: MouseEvent) {
  const { startViewTransition } = useViewTransition(() => {
    settingsStore.setColorScheme(settingsStore.settings.app.colorScheme === 'dark' ? 'light' : 'dark')
  })
  startViewTransition()?.ready.then(() => {
    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    document.documentElement.animate(
      {
        clipPath: settingsStore.settings.app.colorScheme !== 'dark' ? clipPath : clipPath.reverse(),
      },
      {
        duration: 300,
        easing: 'ease-out',
        pseudoElement: settingsStore.settings.app.colorScheme !== 'dark' ? '::view-transition-new(root)' : '::view-transition-old(root)',
      },
    )
  })
}

const avatarError = ref(false)
watch(() => userStore.avatar, () => {
  if (avatarError.value) {
    avatarError.value = false
  }
})
</script>

<template>
  <div class="tools flex items-center gap-4 whitespace-nowrap px-4">
    <span v-if="settingsStore.settings.navSearch.enable && settingsStore.mode === 'pc'" class="group inline-flex cursor-pointer items-center gap-1 rounded-2 bg-stone-1 px-2 py-1.5 text-dark ring-stone-3 ring-inset transition dark:bg-stone-9 dark:text-white hover:ring-1 dark:ring-stone-7" @click="eventBus.emit('global-search-toggle')">
      <SvgIcon name="ri:search-line" />
      <span class="text-sm text-stone-5 transition group-hover:text-dark dark:group-hover:text-white">{{ t('app.search.text') }}</span>
      <HKbd v-if="settingsStore.settings.navSearch.enableHotkeys" class="ml-2">{{ settingsStore.os === 'mac' ? '⌥' : 'Alt' }} S</HKbd>
    </span>
    <div class="flex items-center empty:hidden">
      <span v-if="settingsStore.settings.navSearch.enable && settingsStore.mode === 'mobile'" class="item" @click="eventBus.emit('global-search-toggle')">
        <SvgIcon name="ri:search-line" />
      </span>
      <HDropdown v-if="settingsStore.settings.toolbar.enableNotification" class="item">
        <HBadge :value="notificationStore.total > 9 ? true : notificationStore.total">
          <SvgIcon name="ri:notification-3-line" />
        </HBadge>
        <template #dropdown>
          <Notification />
        </template>
      </HDropdown>
      <I18nSelector class="item">
        <SvgIcon name="ri:translate" />
      </I18nSelector>
      <span v-if="settingsStore.mode === 'pc' && settingsStore.settings.toolbar.enableFullscreen" class="item" @click="toggle">
        <SvgIcon :name="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'" />
      </span>
      <span v-if="settingsStore.settings.toolbar.enablePageReload" class="item" @click="mainPage.reload()">
        <SvgIcon name="iconoir:refresh-double" />
      </span>
      <span v-if="settingsStore.settings.toolbar.enableColorScheme" class="item" @click="toggleColorScheme">
        <SvgIcon :name="settingsStore.settings.app.colorScheme === 'light' ? 'ri:sun-line' : 'ri:moon-line'" />
      </span>
    </div>
    <HDropdownMenu
      :items="[
        [
          { label: generateI18nTitle('route.home', settingsStore.settings.home.title), handle: () => router.push({ path: settingsStore.settings.home.fullPath }), hide: !settingsStore.settings.home.enable },
          { label: t('app.preferences'), handle: () => eventBus.emit('global-preferences-toggle'), hide: !settingsStore.settings.app.enableUserPreferences },
        ],
        [
          { label: t('app.hotkeys'), handle: () => eventBus.emit('global-hotkeys-intro-toggle'), hide: settingsStore.mode !== 'pc' },
        ],
        [
          { label: t('app.logout'), handle: () => userStore.logout() },
        ],
      ]"
    >
      <div flex-center cursor-pointer gap-1>
        <img v-if="userStore.avatar && !avatarError" :src="userStore.avatar" :onerror="() => (avatarError = true)" class="h-[24px] w-[24px] rounded-full">
        <SvgIcon v-else name="carbon:user-avatar-filled-alt" :size="24" class="text-gray-400" />
        {{ userStore.account }}
        <SvgIcon name="ep:caret-bottom" />
      </div>
    </HDropdownMenu>
  </div>
</template>

<style lang="scss" scoped>
.item {
  --at-apply: flex px-2 py-1 cursor-pointer;
}
</style>
