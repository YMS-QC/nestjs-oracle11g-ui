<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { createDefu } from 'defu'
import themes from '../../../../themes'
import settingsDefault from '@/settings'
import type { Settings } from '#/global'
import apiUser from '@/api/modules/user'
import eventBus from '@/utils/eventBus'
import useSettingsStore from '@/store/modules/settings'

defineOptions({
  name: 'Preferences',
})

const settingsStore = useSettingsStore()

const isShow = ref(false)
/**
 * 提供用户可配置的选项
 * 不需要配置的选项，可以在这里删除或注释掉，页面上会自动隐藏
 * 需注意，boolean 类型的选项，会先判断系统是否开启了该功能，如果系统没有开启，那即便在这里允许配置，页面上也不会显示
 */
const preferences = ref<Settings.all>({
  app: {
    colorScheme: settingsDefault.app.colorScheme,
    lightTheme: settingsDefault.app.lightTheme,
    darkTheme: settingsDefault.app.darkTheme,
    enableProgress: settingsDefault.app.enableProgress,
  },
  menu: {
    menuMode: settingsDefault.menu.menuMode,
    isRounded: settingsDefault.menu.isRounded,
    menuActiveStyle: settingsDefault.menu.menuActiveStyle,
    switchMainMenuAndPageJump: settingsDefault.menu.switchMainMenuAndPageJump,
    subMenuOnlyOneHide: settingsDefault.menu.subMenuOnlyOneHide,
    subMenuUniqueOpened: settingsDefault.menu.subMenuUniqueOpened,
    subMenuCollapse: settingsDefault.menu.subMenuCollapse,
    enableSubMenuCollapseButton: settingsDefault.menu.enableSubMenuCollapseButton,
  },
  layout: {
    widthMode: settingsDefault.layout.widthMode,
  },
  mainPage: {
    enableTransition: settingsDefault.mainPage.enableTransition,
    transitionMode: settingsDefault.mainPage.transitionMode,
  },
  topbar: {
    mode: settingsDefault.topbar.mode,
    switchTabbarAndToolbar: settingsDefault.topbar.switchTabbarAndToolbar,
  },
  tabbar: {
    enable: settingsDefault.tabbar.enable,
    style: settingsDefault.tabbar.style,
    enableIcon: settingsDefault.tabbar.enableIcon,
    mergeTabsBy: settingsDefault.tabbar.mergeTabsBy,
    enableMemory: settingsDefault.tabbar.enableMemory,
  },
  breadcrumb: {
    enable: settingsDefault.breadcrumb.enable,
    style: settingsDefault.breadcrumb.style,
    enableMainMenu: settingsDefault.breadcrumb.enableMainMenu,
  },
})

const isDark = computed({
  get() {
    return preferences.value.app?.colorScheme === 'dark'
  },
  set(value) {
    preferences.value.app?.colorScheme && (preferences.value.app.colorScheme = value ? 'dark' : 'light')
  },
})

const themeList = computed(() => {
  return Object.keys(themes).map((key) => {
    return {
      label: key,
      value: (themes as any)[key],
    }
  }).filter((item) => {
    return item.value['color-scheme'] === preferences.value.app?.colorScheme
  })
})

watch(() => preferences.value, (val) => {
  settingsStore.updateSettings(cloneDeep(val))
  // 更新用户偏好设置
  apiUser.preferencesEdit(JSON.stringify(val))
}, {
  deep: true,
})

/**
 * 此处没有使用 lodash 的 defaultsDeep 函数，而是基于 defu 库自定义了一个函数，只合并 preferences 中有的属性，而不是全部合并
 * 这样做的目的是为了避免用户历史遗留的配置项始终存在
 */
const customDefaultsDeep = createDefu((obj, key) => {
  if (obj[key] === undefined) {
    delete obj[key]
    return true
  }
})

onMounted(() => {
  eventBus.on('global-preferences-toggle', () => {
    isShow.value = !isShow.value
  })
  // 获取用户偏好设置
  apiUser.preferences().then((res) => {
    preferences.value = customDefaultsDeep(JSON.parse(res.data.preferences || '{}'), preferences.value)
  })
})
</script>

<template>
  <HSlideover v-model="isShow" title="偏好设置">
    <div class="rounded-2 bg-rose/20 px-4 py-2 text-sm/6 c-rose">
      <p class="my-1">
        这是一个可以实现用户个性化配置的功能，需要开发者接入后端接口，用于保存用户的配置。
      </p>
    </div>
    <div v-if="preferences.app?.hasOwnProperty('colorScheme') || (preferences.app?.hasOwnProperty('lightTheme') && preferences.app?.hasOwnProperty('darkTheme'))" class="divider">
      颜色主题风格
    </div>
    <div v-if="preferences.app?.hasOwnProperty('colorScheme')" class="flex items-center justify-center pb-4">
      <HToggle v-model="isDark" on-icon="ri:sun-line" off-icon="ri:moon-line" />
    </div>
    <div v-if="preferences.app?.hasOwnProperty('lightTheme') && preferences.app?.hasOwnProperty('darkTheme')" class="themes">
      <div v-for="item in themeList" :key="item.label" class="theme" :class="{ active: isDark ? preferences.app.darkTheme === item.label : preferences.app.lightTheme === item.label }" @click="isDark ? preferences.app?.hasOwnProperty('darkTheme') && (preferences.app.darkTheme = item.label) : preferences.app?.hasOwnProperty('lightTheme') && (preferences.app.lightTheme = item.label)">
        <div class="content" :style="`background-color: rgb(${item.value['--ui-primary']});`" />
      </div>
    </div>
    <div v-if="settingsStore.mode === 'pc' && preferences.menu?.hasOwnProperty('menuMode')" class="divider">
      导航栏模式
    </div>
    <div v-if="settingsStore.mode === 'pc' && preferences.menu?.hasOwnProperty('menuMode')" class="menu-mode">
      <HTooltip text="侧边栏模式 (含主导航)" placement="bottom" :delay="500">
        <div class="mode mode-side" :class="{ active: preferences.menu.menuMode === 'side' }" @click="preferences.menu?.hasOwnProperty('menuMode') && (preferences.menu.menuMode = 'side')">
          <div class="mode-container" />
        </div>
      </HTooltip>
      <HTooltip text="顶部模式" placement="bottom" :delay="500">
        <div class="mode mode-head" :class="{ active: preferences.menu.menuMode === 'head' }" @click="preferences.menu?.hasOwnProperty('menuMode') && (preferences.menu.menuMode = 'head')">
          <div class="mode-container" />
        </div>
      </HTooltip>
      <HTooltip text="侧边栏模式 (不含主导航)" placement="bottom" :delay="500">
        <div class="mode mode-single" :class="{ active: preferences.menu.menuMode === 'single' }" @click="preferences.menu?.hasOwnProperty('menuMode') && (preferences.menu.menuMode = 'single')">
          <div class="mode-container" />
        </div>
      </HTooltip>
      <HTooltip text="侧边栏精简模式" placement="bottom" :delay="500">
        <div class="mode mode-only-side" :class="{ active: preferences.menu.menuMode === 'only-side' }" @click="preferences.menu?.hasOwnProperty('menuMode') && (preferences.menu.menuMode = 'only-side')">
          <div class="mode-container" />
        </div>
      </HTooltip>
      <HTooltip text="顶部精简模式" placement="bottom" :delay="500">
        <div class="mode mode-only-head" :class="{ active: preferences.menu.menuMode === 'only-head' }" @click="preferences.menu?.hasOwnProperty('menuMode') && (preferences.menu.menuMode = 'only-head')">
          <div class="mode-container" />
        </div>
      </HTooltip>
    </div>
    <div v-if="settingsStore.mode === 'pc' && preferences.layout?.hasOwnProperty('widthMode')" class="divider">
      页宽模式
    </div>
    <div v-if="settingsStore.mode === 'pc' && preferences.layout?.hasOwnProperty('widthMode')" class="app-width-mode">
      <HTooltip text="自适应" placement="bottom" :delay="500">
        <div class="mode mode-adaption" :class="{ active: preferences.layout.widthMode === 'adaption' }" @click="preferences.layout?.hasOwnProperty('widthMode') && (preferences.layout.widthMode = 'adaption')">
          <SvgIcon name="ep:back" class="left" />
          <SvgIcon name="ep:right" class="right" />
        </div>
      </HTooltip>
      <HTooltip text="自适应 (有最小宽度)" placement="bottom" :delay="500">
        <div class="mode mode-adaption-min-width" :class="{ active: preferences.layout.widthMode === 'adaption-min-width' }" @click="preferences.layout?.hasOwnProperty('widthMode') && (preferences.layout.widthMode = 'adaption-min-width')">
          <SvgIcon name="ep:back" class="left" />
          <SvgIcon name="ep:right" class="right" />
        </div>
      </HTooltip>
      <HTooltip text="定宽居中" placement="bottom" :delay="500">
        <div class="mode mode-center" :class="{ active: preferences.layout.widthMode === 'center' }" @click="preferences.layout?.widthMode && (preferences.layout.widthMode = 'center')" />
      </HTooltip>
      <HTooltip text="定宽居中 (有最大宽度)" placement="bottom" :delay="500">
        <div class="mode mode-center-max-width" :class="{ active: preferences.layout.widthMode === 'center-max-width' }" @click="preferences.layout?.widthMode && (preferences.layout.widthMode = 'center-max-width')">
          <SvgIcon name="ep:back" class="left" />
          <SvgIcon name="ep:right" class="right" />
        </div>
      </HTooltip>
    </div>
    <div v-if="settingsDefault.mainPage.enableTransition && preferences.mainPage?.hasOwnProperty('enableTransition')" class="divider">
      页面切换动画
    </div>
    <div v-if="settingsDefault.mainPage.enableTransition && preferences.mainPage?.hasOwnProperty('enableTransition')" class="flex items-center justify-center pb-4">
      <HToggle v-model="preferences.mainPage.enableTransition" />
    </div>
    <div v-if="settingsDefault.mainPage.enableTransition && preferences.mainPage?.hasOwnProperty('transitionMode')" class="transition-mode">
      <HTooltip text="淡入淡出" placement="bottom" :delay="500">
        <div class="mode mode-fade" :class="{ active: preferences.mainPage.transitionMode === 'fade' }" @click="preferences.mainPage?.hasOwnProperty('transitionMode') && (preferences.mainPage.transitionMode = 'fade')" />
      </HTooltip>
      <HTooltip text="向左滑动" placement="bottom" :delay="500">
        <div class="mode mode-slide-left" :class="{ active: preferences.mainPage.transitionMode === 'slide-left' }" @click="preferences.mainPage?.hasOwnProperty('transitionMode') && (preferences.mainPage.transitionMode = 'slide-left')" />
      </HTooltip>
      <HTooltip text="向右滑动" placement="bottom" :delay="500">
        <div class="mode mode-slide-right" :class="{ active: preferences.mainPage.transitionMode === 'slide-right' }" @click="preferences.mainPage?.hasOwnProperty('transitionMode') && (preferences.mainPage.transitionMode = 'slide-right')" />
      </HTooltip>
      <HTooltip text="向上滑动" placement="bottom" :delay="500">
        <div class="mode mode-slide-top" :class="{ active: preferences.mainPage.transitionMode === 'slide-top' }" @click="preferences.mainPage?.hasOwnProperty('transitionMode') && (preferences.mainPage.transitionMode = 'slide-top')" />
      </HTooltip>
      <HTooltip text="向下滑动" placement="bottom" :delay="500">
        <div class="mode mode-slide-bottom" :class="{ active: preferences.mainPage.transitionMode === 'slide-bottom' }" @click="preferences.mainPage?.hasOwnProperty('transitionMode') && (preferences.mainPage.transitionMode = 'slide-bottom')" />
      </HTooltip>
    </div>
    <div v-if="preferences.menu?.hasOwnProperty('switchMainMenuAndPageJump') || preferences.menu?.hasOwnProperty('subMenuOnlyOneHide') || preferences.menu?.hasOwnProperty('subMenuUniqueOpened') || preferences.menu?.hasOwnProperty('subMenuCollapse') || preferences.menu?.hasOwnProperty('enableSubMenuCollapseButton')" class="divider">
      导航栏
    </div>
    <div v-if="preferences.menu?.hasOwnProperty('switchMainMenuAndPageJump')" class="setting-item">
      <div class="label">
        主导航切换跳转
        <HTooltip text="开启该功能后，切换主导航时，页面自动跳转至该主导航下，次导航里第一个导航">
          <SvgIcon name="ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="preferences.menu.switchMainMenuAndPageJump" :disabled="['single', 'only-side', 'only-head'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode)" />
    </div>
    <div v-if="preferences.menu?.hasOwnProperty('subMenuOnlyOneHide')" class="setting-item">
      <div class="label">
        次导航自动隐藏
        <HTooltip text="开启该功能后，切换主导航时，如果次导航里只有一个导航时，则自动隐藏">
          <SvgIcon name="ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="preferences.menu.subMenuOnlyOneHide" :disabled="['single', 'only-side', 'only-head'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode)" />
    </div>
    <div v-if="preferences.menu?.hasOwnProperty('subMenuUniqueOpened')" class="setting-item">
      <div class="label">
        次导航保持展开一个
        <HTooltip text="开启该功能后，次导航只保持单个菜单的展开">
          <SvgIcon name="ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="preferences.menu.subMenuUniqueOpened" :disabled="['only-side', 'only-head'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode)" />
    </div>
    <div v-if="preferences.menu?.hasOwnProperty('subMenuCollapse')" class="setting-item">
      <div class="label">
        次导航是否折叠
      </div>
      <HToggle v-model="preferences.menu.subMenuCollapse" :disabled="['only-side', 'only-head'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode)" />
    </div>
    <div v-if="settingsStore.mode === 'pc' && settingsDefault.menu.enableSubMenuCollapseButton && preferences.menu?.hasOwnProperty('enableSubMenuCollapseButton')" class="setting-item">
      <div class="label">
        显示次导航折叠按钮
      </div>
      <HToggle v-model="preferences.menu.enableSubMenuCollapseButton" :disabled="['only-side', 'only-head'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode)" />
    </div>
    <div v-if="preferences.menu?.hasOwnProperty('isRounded')" class="setting-item">
      <div class="label">
        次导航是否折叠
      </div>
      <HToggle v-model="preferences.menu.isRounded" />
    </div>
    <div v-if="(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode) !== 'single' && preferences.menu?.hasOwnProperty('menuActiveStyle')" class="setting-item">
      <div class="label">
        激活风格
      </div>
      <HCheckList
        v-model="preferences.menu.menuActiveStyle" :options="[
          { icon: 'jam:stop-sign', value: '' },
          { icon: ['head', 'only-head'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode) ? 'ep:caret-top' : 'ep:caret-left', value: 'arrow' },
          { icon: ['side', 'only-side'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode) ? 'tabler:minus-vertical' : 'tabler:minus', value: 'line' },
          { icon: 'icon-park-outline:dot', value: 'dot' },
        ]"
      />
    </div>
    <div v-if="preferences.topbar?.hasOwnProperty('mode') || preferences.topbar?.hasOwnProperty('switchTabbarAndToolbar')" class="divider">
      顶栏
    </div>
    <div v-if="preferences.topbar?.hasOwnProperty('mode')" class="setting-item">
      <div class="label">
        模式
      </div>
      <HCheckList
        v-model="preferences.topbar.mode" :options="[
          { label: '静止', value: 'static' },
          { label: '固定', value: 'fixed' },
          { label: '粘性', value: 'sticky' },
        ]"
      />
    </div>
    <div v-if="preferences.topbar?.hasOwnProperty('switchTabbarAndToolbar')" class="setting-item">
      <div class="label">
        展示切换
        <HTooltip text="切换标签栏和工具栏的展示顺序">
          <SvgIcon name="ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="preferences.topbar.switchTabbarAndToolbar" :disabled="!preferences.tabbar?.enable" />
    </div>
    <div v-if="settingsDefault.tabbar.enable && preferences.tabbar?.hasOwnProperty('enable') || preferences.tabbar?.hasOwnProperty('style') || preferences.tabbar?.hasOwnProperty('enableIcon') || preferences.tabbar?.hasOwnProperty('mergeTabsBy')" class="divider">
      标签栏
    </div>
    <div v-if="settingsDefault.tabbar.enable && preferences.tabbar?.hasOwnProperty('enable')" class="setting-item">
      <div class="label">
        是否启用
      </div>
      <HToggle v-model="preferences.tabbar.enable" />
    </div>
    <div v-if="settingsDefault.tabbar.enable && preferences.tabbar?.hasOwnProperty('style')" class="setting-item">
      <div class="label">
        风格
      </div>
      <HCheckList
        v-model="preferences.tabbar.style" :options="[
          { label: '时尚', value: 'fashion' },
          { label: '卡片', value: 'card' },
          { label: '方块', value: 'square' },
        ]" :disabled="!(preferences.tabbar?.enable ?? settingsDefault.tabbar.enable)"
      />
    </div>
    <div v-if="settingsDefault.tabbar.enable && preferences.tabbar?.hasOwnProperty('enableIcon')" class="setting-item">
      <div class="label">
        是否显示图标
      </div>
      <HToggle v-model="preferences.tabbar.enableIcon" :disabled="!(preferences.tabbar?.enable ?? settingsDefault.tabbar.enable)" />
    </div>
    <div v-if="settingsDefault.tabbar.enable && preferences.tabbar?.hasOwnProperty('mergeTabsBy')" class="setting-item">
      <div class="label">
        标签页合并规则
      </div>
      <HSelect
        v-model="preferences.tabbar.mergeTabsBy" :options="[
          { label: '不合并', value: '' },
          { label: '根据 activeMenu 合并', value: 'activeMenu' },
          { label: '根据路由名称合并', value: 'routeName' },
        ]"
        :disabled="!(preferences.tabbar?.enable ?? settingsDefault.tabbar.enable)"
      />
    </div>
    <div v-if="settingsDefault.tabbar.enable && preferences.tabbar?.hasOwnProperty('enableMemory')" class="setting-item">
      <div class="label">
        是否启用记忆功能
        <HTooltip text="开启该功能后，非固定和非常驻的标签页将在本次会话窗口中始终存在，刷新浏览器或重新登录时不会丢失">
          <SvgIcon name="ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="preferences.tabbar.enableMemory" :disabled="!(preferences.tabbar?.enable ?? settingsDefault.tabbar.enable)" />
    </div>
    <div v-if="settingsStore.mode === 'pc' && settingsDefault.breadcrumb.enable && (preferences.breadcrumb?.hasOwnProperty('enable') || preferences.breadcrumb?.hasOwnProperty('style') || preferences.breadcrumb?.hasOwnProperty('enableMainMenu'))" class="divider">
      面包屑导航
    </div>
    <div v-if="settingsStore.mode === 'pc' && settingsDefault.breadcrumb.enable && preferences.breadcrumb?.hasOwnProperty('enable')" class="setting-item">
      <div class="label">
        是否启用
      </div>
      <HToggle v-model="preferences.breadcrumb.enable" />
    </div>
    <div v-if="settingsStore.mode === 'pc' && settingsDefault.breadcrumb.enable && preferences.breadcrumb?.hasOwnProperty('style')" class="setting-item">
      <div class="label">
        风格
      </div>
      <HCheckList
        v-model="preferences.breadcrumb.style" :options="[
          { label: '默认', value: '' },
          { label: '现代', value: 'modern' },
        ]" :disabled="!(preferences.breadcrumb?.enable ?? settingsDefault.breadcrumb.enable)"
      />
    </div>
    <div v-if="settingsStore.mode === 'pc' && settingsDefault.breadcrumb.enable && settingsDefault.breadcrumb.enableMainMenu && preferences.breadcrumb?.hasOwnProperty('enableMainMenu')" class="setting-item">
      <div class="label">
        是否显示主导航
      </div>
      <HToggle v-model="preferences.breadcrumb.enableMainMenu" :disabled="['single'].includes(preferences.menu?.menuMode ?? settingsDefault.menu.menuMode)" />
    </div>
    <div v-if="preferences.app?.hasOwnProperty('enableProgress')" class="divider">
      其它
    </div>
    <div v-if="settingsDefault.app.enableProgress && preferences.app?.hasOwnProperty('enableProgress')" class="setting-item">
      <div class="label">
        载入进度条
        <HTooltip text="该功能开启时，跳转路由会看到页面顶部有进度条">
          <SvgIcon name="ri:question-line" />
        </HTooltip>
      </div>
      <HToggle v-model="preferences.app.enableProgress" />
    </div>
  </HSlideover>
</template>

<style lang="scss" scoped>
.divider {
  --at-apply: flex items-center justify-between gap-4 my-4 whitespace-nowrap text-sm font-500;

  &::before,
  &::after {
    --at-apply: content-empty w-full h-1px bg-stone-2 dark:bg-stone-6;
  }
}

.themes {
  --at-apply: flex flex-wrap items-center justify-center gap-4 pb-4;

  .theme {
    --at-apply: flex items-center justify-center w-12 h-12 rounded-2 ring-1 ring-stone-2 dark:ring-stone-7 cursor-pointer transition;

    &.active {
      --at-apply: ring-ui-primary ring-2;

      .content {
        --at-apply: rotate-0;
      }
    }

    .content {
      --at-apply: w-6 h-4 rounded-50% -rotate-45 transition;
    }
  }
}

.menu-mode {
  --at-apply: flex items-center justify-center gap-4 pb-4;

  .mode {
    --at-apply: relative w-16 h-12 rounded-2 ring-1 ring-stone-2 dark:ring-stone-7 cursor-pointer transition;

    &.active {
      --at-apply: ring-ui-primary ring-2;
    }

    &::before,
    &::after,
    .mode-container {
      --at-apply: absolute pointer-events-none;
    }

    &::before {
      --at-apply: content-empty bg-ui-primary;
    }

    &::after {
      --at-apply: content-empty bg-ui-primary/60;
    }

    .mode-container {
      --at-apply: bg-ui-primary/20 border-dashed border-ui-primary;

      &::before {
        --at-apply: content-empty absolute w-full h-full;
      }
    }

    &-side {
      &::before {
        --at-apply: top-2 bottom-2 left-2 w-2 rounded-tl-1 rounded-bl-1;
      }

      &::after {
        --at-apply: top-2 bottom-2 left-4.5 w-3;
      }

      .mode-container {
        --at-apply: inset-t-2 inset-r-2 inset-b-2 inset-l-8 rounded-tr-1 rounded-br-1;
      }
    }

    &-head {
      &::before {
        --at-apply: top-2 left-2 right-2 h-2 rounded-tl-1 rounded-tr-1;
      }

      &::after {
        --at-apply: top-4.5 left-2 bottom-2 w-3 rounded-bl-1;
      }

      .mode-container {
        --at-apply: inset-t-4.5 inset-r-2 inset-b-2 inset-l-5.5 rounded-br-1;
      }
    }

    &-single {
      &::after {
        --at-apply: top-2 left-2 bottom-2 w-3 rounded-tl-1 rounded-bl-1;
      }

      .mode-container {
        --at-apply: inset-t-2 inset-r-2 inset-b-2 inset-l-5.5 rounded-tr-1 rounded-br-1;
      }
    }

    &-only-side {
      &::before {
        --at-apply: top-2 bottom-2 left-2 w-2 rounded-tl-1 rounded-bl-1;
      }

      .mode-container {
        --at-apply: inset-t-2 inset-r-2 inset-b-2 inset-l-4.5 rounded-tr-1 rounded-br-1;
      }
    }

    &-only-head {
      &::before {
        --at-apply: top-2 left-2 right-2 h-2 rounded-tl-1 rounded-tr-1;
      }

      .mode-container {
        --at-apply: inset-t-4.5 inset-r-2 inset-b-2 inset-l-2 rounded-bl-1 rounded-br-1;
      }
    }
  }
}

.app-width-mode {
  --at-apply: flex items-center justify-center gap-4 pb-4;

  .mode {
    --at-apply: relative w-16 h-12 rounded-2 ring-1 ring-stone-2 dark:ring-stone-7 cursor-pointer transition of-hidden;

    &.active {
      --at-apply: ring-ui-primary ring-2;
    }

    &-adaption {
      &::before {
        --at-apply: content-empty absolute w-full h-full bg-stone-1 dark:bg-stone-9;
      }

      .left,
      .right {
        --at-apply: absolute top-1/2 -translate-y-1/2;
      }

      .left {
        --at-apply: left-1;
      }

      .right {
        --at-apply: right-1;
      }
    }

    &-adaption-min-width {
      &::before {
        --at-apply: content-empty absolute w-1/2 h-full left-1/2 -translate-x-1/2 bg-stone-1 dark:bg-stone-9;
      }

      .left,
      .right {
        --at-apply: absolute top-1/2 -translate-y-1/2;
      }

      .left {
        --at-apply: left-0.5;
      }

      .right {
        --at-apply: right-0.5;
      }
    }

    &-center {
      &::before {
        --at-apply: content-empty absolute w-3/5 h-full left-1/2 -translate-x-1/2 bg-stone-1 dark:bg-stone-9;
      }
    }

    &-center-max-width {
      &::before {
        --at-apply: content-empty absolute w-3/5 h-full left-1/2 -translate-x-1/2 bg-stone-1 dark:bg-stone-9;
      }

      .left,
      .right {
        --at-apply: absolute top-1/2 -translate-y-1/2;
      }

      .left {
        --at-apply: left-2.5;
      }

      .right {
        --at-apply: right-2.5;
      }
    }
  }
}

.transition-mode {
  --at-apply: flex items-center justify-center gap-4 pb-4;

  .mode {
    --at-apply: relative flex items-center justify-center w-14 h-10 rounded-2 ring-1 ring-stone-2 dark:ring-stone-7 cursor-pointer;

    &.active {
      --at-apply: ring-ui-primary ring-2;
    }

    &::after {
      --at-apply: content-empty absolute w-3/5 h-3/5 top-1/5 left-1/5 rounded-2 bg-stone-2 dark:bg-stone-9 transition;
    }

    &.mode-fade {
      &::after {
        animation: transition-mode-fade-after 1.5s infinite;
      }

      @keyframes transition-mode-fade-after {
        0% {
          opacity: 1;
        }

        30%,
        35% {
          opacity: 0;
        }

        65% {
          opacity: 1;
        }
      }
    }

    &.mode-slide-left {
      &::after {
        animation: transition-mode-slide-left 1.5s infinite;
      }

      @keyframes transition-mode-slide-left {
        0% {
          opacity: 1;
        }

        30% {
          opacity: 0;
          transform: translate(-30%, 0);
        }

        35% {
          opacity: 0;
          transform: translate(30%, 0);
        }

        65% {
          opacity: 1;
        }
      }
    }

    &.mode-slide-right {
      &::after {
        animation: transition-mode-slide-right 1.5s infinite;
      }

      @keyframes transition-mode-slide-right {
        0% {
          opacity: 1;
        }

        30% {
          opacity: 0;
          transform: translate(30%, 0);
        }

        35% {
          opacity: 0;
          transform: translate(-30%, 0);
        }

        100% {
          opacity: 1;
        }
      }
    }

    &.mode-slide-top {
      &::after {
        animation: transition-mode-slide-top 1.5s infinite;
      }

      @keyframes transition-mode-slide-top {
        0% {
          opacity: 1;
        }

        30% {
          opacity: 0;
          transform: translate(0, -30%);
        }

        35% {
          opacity: 0;
          transform: translate(0, 30%);
        }

        100% {
          opacity: 1;
        }
      }
    }

    &.mode-slide-bottom {
      &::after {
        animation: transition-mode-slide-bottom 1.5s infinite;
      }

      @keyframes transition-mode-slide-bottom {
        0% {
          opacity: 1;
        }

        30% {
          opacity: 0;
          transform: translate(0, 30%);
        }

        35% {
          opacity: 0;
          transform: translate(0, -30%);
        }

        100% {
          opacity: 1;
        }
      }
    }
  }
}

.setting-item {
  --at-apply: flex items-center justify-between gap-4 px-4 py-2 rounded-2 transition hover:bg-stone-1 dark:hover:bg-stone-9;

  .label {
    --at-apply: flex items-center flex-shrink-0 gap-2 text-sm;

    i {
      --at-apply: text-xl text-orange cursor-help;
    }
  }
}
</style>
