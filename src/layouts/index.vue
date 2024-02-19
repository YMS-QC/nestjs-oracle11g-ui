<script setup lang="ts">
import hotkeys from 'hotkeys-js'
import Header from './components/Header/index.vue'
import MainSidebar from './components/MainSidebar/index.vue'
import SubSidebar from './components/SubSidebar/index.vue'
import Topbar from './components/Topbar/index.vue'
import Search from './components/Search/index.vue'
import Preferences from './components/Preferences/index.vue'
import HotkeysIntro from './components/HotkeysIntro/index.vue'
import AppSetting from './components/AppSetting/index.vue'
import IframeView from './components/views/iframe.vue'
import LinkView from './components/views/link.vue'
import Copyright from './components/Copyright/index.vue'
import BackTop from './components/BackTop/index.vue'
import useSettingsStore from '@/store/modules/settings'
import useKeepAliveStore from '@/store/modules/keepAlive'
import useMenuStore from '@/store/modules/menu'
import eventBus from '@/utils/eventBus'

defineOptions({
  name: 'Layout',
})

const routeInfo = useRoute()

const settingsStore = useSettingsStore()
const keepAliveStore = useKeepAliveStore()
const menuStore = useMenuStore()

const mainPage = useMainPage()
const menu = useMenu()

const isIframe = computed(() => !!routeInfo.meta.iframe)
const isLink = computed(() => !!routeInfo.meta.link)

useWatermark()

watch(() => settingsStore.settings.menu.subMenuCollapse, (val) => {
  if (settingsStore.mode === 'mobile') {
    if (!val) {
      document.body.classList.add('overflow-hidden')
    }
    else {
      document.body.classList.remove('overflow-hidden')
    }
  }
})

watch(() => routeInfo.path, () => {
  if (settingsStore.mode === 'mobile') {
    settingsStore.$patch((state) => {
      state.settings.menu.subMenuCollapse = true
    })
  }
})

onMounted(() => {
  hotkeys('f5', (e) => {
    if (settingsStore.settings.toolbar.enablePageReload) {
      e.preventDefault()
      mainPage.reload()
    }
  })
  hotkeys('alt+`', (e) => {
    if (settingsStore.settings.menu.enableHotkeys) {
      e.preventDefault()
      menu.switchTo(menuStore.actived + 1 < menuStore.allMenus.length ? menuStore.actived + 1 : 0)
    }
  })
  hotkeys('alt+up,alt+down', (e, handle) => {
    e.preventDefault()
    switch (handle.key) {
      case 'alt+up':
        mainPage.maximize(true)
        break
      case 'alt+down':
        mainPage.maximize(false)
        break
    }
  })
})
onUnmounted(() => {
  hotkeys.unbind('f5')
  hotkeys.unbind('alt+`')
  hotkeys.unbind('alt+up,alt+down')
})

const enableAppSetting = import.meta.env.VITE_APP_SETTING === 'true'
</script>

<template>
  <div class="layout">
    <div id="app-main" :class="{ 'main-page-maximize': settingsStore.mainPageMaximizeStatus }">
      <Header />
      <div class="wrapper">
        <div class="sidebar-container" :class="{ show: settingsStore.mode === 'mobile' && !settingsStore.settings.menu.subMenuCollapse }">
          <MainSidebar />
          <SubSidebar />
        </div>
        <div class="sidebar-mask" :class="{ show: settingsStore.mode === 'mobile' && !settingsStore.settings.menu.subMenuCollapse }" @click="settingsStore.toggleSidebarCollapse()" />
        <div class="main-container" :style="{ 'padding-bottom': routeInfo.meta.paddingBottom }">
          <Topbar />
          <div class="main">
            <div v-show="settingsStore.mainPageMaximizeStatus" class="exit-main-page-maximize" @click="settingsStore.setMainPageMaximize()">
              <SvgIcon name="ri:logout-box-line" />
            </div>
            <RouterView v-slot="{ Component, route }">
              <Transition :name="settingsStore.settings.mainPage.enableTransition ? settingsStore.settings.mainPage.transitionMode : ''" mode="out-in" appear>
                <KeepAlive :include="keepAliveStore.list">
                  <component :is="Component" v-show="!(isIframe || isLink)" :key="route.fullPath" />
                </KeepAlive>
              </Transition>
            </RouterView>
            <IframeView v-show="isIframe && !isLink" />
            <LinkView v-if="isLink" />
          </div>
          <Copyright />
        </div>
      </div>
    </div>
    <Search />
    <Preferences v-if="settingsStore.settings.app.enableUserPreferences" />
    <HotkeysIntro />
    <template v-if="enableAppSetting">
      <div class="app-setting" @click="eventBus.emit('global-app-setting-toggle')">
        <SvgIcon name="uiw:setting-o" class="icon" />
      </div>
      <AppSetting />
    </template>
    <BackTop />
  </div>
</template>

<style lang="scss" scoped>
[data-app-width-mode="adaption"] {
  #app-main {
    width: 100%;
  }
}

[data-app-width-mode="adaption-min-width"] {
  #app-main {
    width: max(var(--g-app-width), 100%);
  }
}

[data-app-width-mode="center"] {
  #app-main {
    width: var(--g-app-width);
  }
}

[data-app-width-mode="center-max-width"] {
  #app-main {
    width: min(var(--g-app-width), 100%);
  }
}

[data-mode="mobile"] {
  #app-main {
    width: 100%;
  }

  .sidebar-container {
    transform: translateX(calc((var(--g-main-sidebar-width) + var(--g-sub-sidebar-width)) * -1));

    &.show {
      transform: translateX(0);
    }
  }

  .main-container {
    margin-left: 0 !important;
  }

  &[data-menu-mode="single"] {
    .sidebar-container {
      transform: translateX(calc(var(--g-sub-sidebar-width) * -1));

      &.show {
        transform: translateX(0);
      }
    }
  }
}

.layout {
  height: 100%;
}

#app-main {
  height: 100%;
  margin: 0 auto;

  // 当前标签页全屏
  &.main-page-maximize {
    header,
    .sidebar-container {
      display: none;
    }

    .wrapper {
      padding-top: 0;

      .main-container {
        margin-left: 0;

        .topbar-container {
          display: none;
        }

        .main {
          margin: 0;
        }
      }
    }

    :deep([data-fixed-calc-width]) {
      width: 100%;
      transform: translateX(-50%);
    }
  }
}

.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: padding-top 0.3s;

  .sidebar-container {
    position: fixed;
    z-index: 1010;
    top: 0;
    bottom: 0;
    display: flex;
    width: calc(var(--g-main-sidebar-actual-width) + var(--g-sub-sidebar-actual-width));
    box-shadow: -1px 0 0 0 var(--g-border-color), 1px 0 0 0 var(--g-border-color);
    transition: width 0.3s, transform 0.3s, box-shadow 0.3s, top 0.3s;
  }

  .sidebar-mask {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(transparent 1px, rgb(0 0 0 / 30%) 1px);
    background-size: 4px 4px;
    backdrop-filter: saturate(50%) blur(4px);
    transition: all 0.2s;
    opacity: 0;
    visibility: hidden;

    &.show {
      opacity: 1;
      visibility: visible;
    }
  }

  .main-sidebar-container:not(.main-sidebar-leave-active) + .sub-sidebar-container {
    left: var(--g-main-sidebar-width);
  }

  .main-container {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    margin-left: calc(var(--g-main-sidebar-actual-width) + var(--g-sub-sidebar-actual-width));
    background-color: var(--g-bg);
    box-shadow: -1px 0 0 0 var(--g-border-color), 1px 0 0 0 var(--g-border-color);
    transition: margin-left 0.3s, background-color 0.3s, box-shadow 0.3s;

    .main {
      height: 100%;
      flex: auto;
      position: relative;
      overflow: hidden;
      transition: 0.3s;

      .exit-main-page-maximize {
        --at-apply: bg-stone-7 dark:bg-stone-3 text-stone-3 dark:text-stone-7 op-50 hover:op-100 transition-opacity;

        position: fixed;
        z-index: 1000;
        right: -40px;
        top: -40px;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        cursor: pointer;

        i {
          position: absolute;
          bottom: 16px;
          left: 16px;
        }
      }
    }

    .topbar-container.has-tabbar + .main {
      margin: var(--g-tabbar-height) 0 0;
    }

    .topbar-container.has-toolbar + .main {
      margin: var(--g-toolbar-height) 0 0;
    }

    .topbar-container.has-tabbar.has-toolbar + .main {
      margin: calc(var(--g-tabbar-height) + var(--g-toolbar-height)) 0 0;
    }
  }
}

header:not(.header-leave-active) + .wrapper {
  padding-top: var(--g-header-height);

  .sidebar-container {
    top: var(--g-header-height);

    :deep(.sidebar-logo) {
      display: none;
    }
  }

  .main-container {
    .topbar-container {
      top: var(--g-header-height);

      :deep(.tools) {
        display: none;
      }
    }
  }
}

.app-setting {
  --at-apply: text-white dark:text-dark bg-ui-primary;

  position: fixed;
  z-index: 10;
  right: 0;
  top: calc(50% + 250px);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  font-size: 24px;
  cursor: pointer;

  .icon {
    animation: rotate 5s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}

// 主内容区动画
.fade-enter-active,
.slide-left-enter-active,
.slide-right-enter-active,
.slide-top-enter-active,
.slide-bottom-enter-active {
  transition: 0.2s;
}

.fade-leave-active,
.slide-left-leave-active,
.slide-right-leave-active,
.slide-top-leave-active,
.slide-bottom-leave-active {
  transition: 0.15s;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-from {
  opacity: 0;
  margin-left: 20px;
}

.slide-left-leave-to {
  opacity: 0;
  margin-left: -20px;
}

.slide-right-enter-from {
  opacity: 0;
  margin-left: -20px;
}

.slide-right-leave-to {
  opacity: 0;
  margin-left: 20px;
}

.slide-top-enter-from {
  opacity: 0;
  margin-top: 20px;
}

.slide-top-leave-to {
  opacity: 0;
  margin-top: -20px;
}

.slide-bottom-enter-from {
  opacity: 0;
  margin-top: -20px;
}

.slide-bottom-leave-to {
  opacity: 0;
  margin-top: 20px;
}
</style>
