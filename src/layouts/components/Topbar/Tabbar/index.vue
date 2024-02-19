<script setup lang="ts">
import Sortable from 'sortablejs'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import { useI18n } from 'vue-i18n'
import hotkeys from 'hotkeys-js'
import Message from 'vue-m-message'
import { useMagicKeys } from '@vueuse/core'
import useSettingsStore from '@/store/modules/settings'
import useTabbarStore from '@/store/modules/tabbar'
import eventBus from '@/utils/eventBus'
import storage from '@/utils/storage'
import { i18nTitleInjectionKey } from '@/utils/injectionKeys'
import type { Tabbar } from '#/global'

defineOptions({
  name: 'Tabbar',
})

const route = useRoute()
const router = useRouter()

const settingsStore = useSettingsStore()
const tabbarStore = useTabbarStore()

const tabbar = useTabbar()
const mainPage = useMainPage()

const keys = useMagicKeys({ reactive: true })

const { t } = useI18n()

const generateI18nTitle = inject(i18nTitleInjectionKey, Function, true)

const activedTabId = computed(() => tabbar.getId())
const isShowMoreAction = computed(() => tabbarStore.list.length > 1 && (tabbar.checkCloseOtherSide() || tabbar.checkCloseLeftSide() || tabbar.checkCloseRightSide()))

const tabsRef = ref()
const tabContainerRef = ref()
const tabRef = ref<any>([])
function setTabRef(el: any) {
  return tabRef.value.push(el)
}
onBeforeUpdate(() => {
  tabRef.value = []
})
const dropdownTabContainerRef = ref()

const isDragging = ref(false)
let tabSortable: Sortable
// eslint-disable-next-line unused-imports/no-unused-vars
let dropdownTabSortable: Sortable
onMounted(() => {
  tabSortable = new Sortable(tabContainerRef.value.$el, {
    animation: 200,
    ghostClass: 'tab-ghost',
    draggable: '.tab',
    handle: '.drag-handle',
    filter: '.no-drag',
    onStart: () => {
      isDragging.value = true
    },
    onEnd: () => {
      isDragging.value = false
    },
    onUpdate: (e) => {
      if (e.newIndex !== undefined && e.oldIndex !== undefined) {
        tabbarStore.sort(e.newIndex, e.oldIndex)
      }
    },
  })
})
watch(() => dropdownTabContainerRef.value, (val) => {
  if (val) {
    dropdownTabSortable = new Sortable(dropdownTabContainerRef.value.$el, {
      animation: 200,
      ghostClass: 'ghost',
      draggable: '.tab',
      filter: '.no-drag',
      onStart: () => {
        isDragging.value = true
      },
      onEnd: () => {
        isDragging.value = false
      },
      onUpdate: (e) => {
        if (e.newIndex !== undefined && e.oldIndex !== undefined) {
          tabbarStore.sort(e.newIndex, e.oldIndex)
        }
      },
    })
  }
})
watch(() => settingsStore.mode, (val) => {
  nextTick(() => {
    tabSortable?.option('disabled', val === 'mobile')
  })
}, {
  immediate: true,
})

watch(() => route, (val) => {
  if (settingsStore.settings.tabbar.enable) {
    tabbarStore.add(val).then(() => {
      const index = tabbarStore.list.findIndex(item => item.tabId === activedTabId.value)
      if (index !== -1) {
        scrollTo(tabRef.value[index].offsetLeft)
        tabbarScrollTip()
      }
    })
  }
}, {
  immediate: true,
  deep: true,
})

function tabbarScrollTip() {
  if (tabContainerRef.value.$el.clientWidth > tabsRef.value.clientWidth && !storage.local.has('tabbarScrollTip')) {
    Message.info('顶部标签栏数量超过展示区域范围，你可以将鼠标移到标签栏上，然后通过鼠标滚轮滑动浏览', {
      title: '温馨提示',
      duration: 10000,
      closable: true,
      onClose: () => {
        storage.local.set('tabbarScrollTip', '')
      },
    })
  }
}
function tabbarMaximizeTip() {
  if (!storage.local.has('tabbarMaximizeTip')) {
    Message.info('你也可以通过双击标签栏进行最大化操作', {
      title: '温馨提示',
      duration: 10000,
      closable: true,
      onClose: () => {
        storage.local.set('tabbarMaximizeTip', '')
      },
    })
  }
}
function handlerMouserScroll(event: WheelEvent) {
  tabsRef.value.scrollBy({
    left: (event.deltaY || event.detail) > 0 ? 50 : -50,
  })
}
function scrollTo(offsetLeft: number) {
  tabsRef.value.scrollTo({
    left: offsetLeft - 50,
    behavior: 'smooth',
  })
}
function actionCommand(command: 'search-tabs' | 'other-side' | 'left-side' | 'right-side') {
  switch (command) {
    case 'search-tabs':
      eventBus.emit('global-search-toggle', 'tab')
      break
    case 'other-side':
      tabbar.closeOtherSide()
      break
    case 'left-side':
      tabbar.closeLeftSide()
      break
    case 'right-side':
      tabbar.closeRightSide()
      break
  }
}
function onTabbarContextmenu(event: MouseEvent, routeItem: Tabbar.recordRaw) {
  event.preventDefault()
  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    zIndex: 1000,
    iconFontClass: '',
    customClass: 'contextmenu-custom',
    items: [
      {
        label: t('app.tabbar.reload'),
        icon: 'i-ri:refresh-line',
        disabled: routeItem.tabId !== activedTabId.value,
        onClick: () => mainPage.reload(),
      },
      {
        label: t('app.tabbar.close'),
        icon: 'i-ri:close-line',
        disabled: tabbarStore.list.length <= 1 || routeItem.isPin || routeItem.isPermanent,
        divided: true,
        onClick: () => {
          tabbar.closeById(routeItem.tabId)
        },
      },
      {
        label: routeItem.isPin ? t('app.tabbar.unpin') : t('app.tabbar.pin'),
        icon: routeItem.isPin ? 'i-ri:pushpin-line' : 'i-ri:pushpin-2-line',
        // 主页不允许被固定，因为如果固定主页且主页未启用，会导致登录时进入路由死循环状态
        disabled: routeItem.fullPath === settingsStore.settings.home.fullPath || routeItem.isPermanent,
        onClick: () => {
          if (routeItem.isPin) {
            tabbarStore.unPin(routeItem.tabId)
          }
          else {
            tabbarStore.pin(routeItem.tabId)
          }
        },
      },
      {
        label: t('app.tabbar.maximize'),
        icon: 'i-ri:picture-in-picture-exit-line',
        onClick: () => {
          if (routeItem.tabId !== activedTabId.value) {
            router.push(routeItem.fullPath)
          }
          tabbarMaximizeTip()
          settingsStore.setMainPageMaximize()
        },
      },
      {
        label: t('app.tabbar.newWindow'),
        icon: 'i-ci:window',
        divided: true,
        onClick: () => {
          const details = router.resolve(routeItem.fullPath)
          window.open(details.href, '_blank')
        },
      },
      {
        label: t('app.tabbar.closeOtherSide'),
        disabled: !tabbar.checkCloseOtherSide(routeItem.tabId),
        onClick: () => {
          tabbar.closeOtherSide(routeItem.tabId)
        },
      },
      {
        label: t('app.tabbar.closeLeftSide'),
        disabled: !tabbar.checkCloseLeftSide(routeItem.tabId),
        onClick: () => {
          tabbar.closeLeftSide(routeItem.tabId)
        },
      },
      {
        label: t('app.tabbar.closeRightSide'),
        disabled: !tabbar.checkCloseRightSide(routeItem.tabId),
        onClick: () => {
          tabbar.closeRightSide(routeItem.tabId)
        },
      },
    ],
  })
}

function iconName(isActive: boolean, icon: Tabbar.recordRaw['icon'], activeIcon: Tabbar.recordRaw['activeIcon']) {
  let name
  if ((!isActive && icon) || (isActive && !activeIcon)) {
    name = icon
  }
  else if (isActive && activeIcon) {
    name = activeIcon
  }
  return name
}

onMounted(() => {
  hotkeys('alt+left,alt+right,alt+w,alt+1,alt+2,alt+3,alt+4,alt+5,alt+6,alt+7,alt+8,alt+9,alt+0', (e, handle) => {
    if (settingsStore.settings.tabbar.enable && settingsStore.settings.tabbar.enableHotkeys) {
      e.preventDefault()
      switch (handle.key) {
        // 切换到当前标签页紧邻的上一个标签页
        case 'alt+left':
          if (tabbarStore.list[0].tabId !== activedTabId.value) {
            const index = tabbarStore.list.findIndex(item => item.tabId === activedTabId.value)
            router.push(tabbarStore.list[index - 1].fullPath)
          }
          break
        // 切换到当前标签页紧邻的下一个标签页
        case 'alt+right':
          if (tabbarStore.list.at(-1)?.tabId !== activedTabId.value) {
            const index = tabbarStore.list.findIndex(item => item.tabId === activedTabId.value)
            router.push(tabbarStore.list[index + 1].fullPath)
          }
          break
        // 关闭当前标签页
        case 'alt+w':
          tabbar.closeById(activedTabId.value)
          break
        // 切换到第 n 个标签页
        case 'alt+1':
        case 'alt+2':
        case 'alt+3':
        case 'alt+4':
        case 'alt+5':
        case 'alt+6':
        case 'alt+7':
        case 'alt+8':
        case 'alt+9':
        {
          const number = Number(handle.key.split('+')[1])
          tabbarStore.list[number - 1]?.fullPath && router.push(tabbarStore.list[number - 1].fullPath)
          break
        }
        // 切换到最后一个标签页
        case 'alt+0':
          router.push(tabbarStore.list[tabbarStore.list.length - 1].fullPath)
          break
      }
    }
  })
})
onUnmounted(() => {
  hotkeys.unbind('alt+q,alt+e,alt+w,alt+1,alt+2,alt+3,alt+4,alt+5,alt+6,alt+7,alt+8,alt+9,alt+0')
})
</script>

<template>
  <div class="tabbar-container">
    <div
      ref="tabsRef" class="tabs" :class="{
        'tabs-ontop': settingsStore.settings.topbar.switchTabbarAndToolbar,
        [`tabs-${settingsStore.settings.tabbar.style}`]: true,
      }" @wheel.prevent="handlerMouserScroll"
    >
      <TransitionGroup ref="tabContainerRef" :name="!isDragging ? 'tabbar' : undefined" tag="div" class="tab-container" :class="{ dragging: isDragging }">
        <div
          v-for="(element, index) in tabbarStore.list" :key="settingsStore.settings.tabbar.mergeTabsBy === 'routeName' && element.routeName ? element.routeName : element.tabId"
          :ref="setTabRef" class="tab" :class="{
            'tab-ontop': settingsStore.settings.topbar.switchTabbarAndToolbar,
            'actived': element.tabId === activedTabId,
            'no-drag': element.isPermanent || element.isPin,
          }" :title="element.customTitleList.find(item => item.fullPath === element.fullPath)?.title || generateI18nTitle(element.i18n, element.title)" @click="router.push(element.fullPath)" @dblclick="settingsStore.setMainPageMaximize()" @contextmenu="onTabbarContextmenu($event, element)"
        >
          <div class="tab-dividers" />
          <div class="tab-background" />
          <div class="tab-content">
            <div :key="element.tabId" class="title">
              <SvgIcon v-if="settingsStore.settings.tabbar.enableIcon && iconName(element.tabId === activedTabId, element.icon, element.activeIcon)" :name="iconName(element.tabId === activedTabId, element.icon, element.activeIcon)!" class="icon" />
              {{ element.customTitleList.find(item => item.fullPath === element.fullPath)?.title || generateI18nTitle(element.i18n, element.title) }}
            </div>
            <SvgIcon v-if="!element.isPermanent && element.isPin" class="action-icon" name="ri:pushpin-2-fill" @click.stop="tabbarStore.unPin(element.tabId)" />
            <SvgIcon v-else-if="!element.isPermanent && tabbarStore.list.length > 1" name="ri:close-fill" class="action-icon" @click.stop="tabbar.closeById(element.tabId)" />
            <div v-show="keys.alt && index < 9" class="hotkey-number">
              {{ index + 1 }}
            </div>
            <div class="drag-handle" />
          </div>
        </div>
      </TransitionGroup>
    </div>
    <div v-if="isShowMoreAction" class="more-action">
      <HDropdown placement="bottom-end" popper-class="tabbar-dropdown">
        <SvgIcon name="ri:arrow-down-s-fill" class="icon" />
        <template #dropdown>
          <div class="quick-button">
            <button v-if="settingsStore.settings.navSearch.enable" class="button" :title="t('app.tabbar.searchTabs')" @click="actionCommand('search-tabs')">
              <SvgIcon name="ep:search" />
            </button>
            <button class="button" :disabled="!tabbar.checkCloseOtherSide()" :title="t('app.tabbar.closeOtherSide')" @click="actionCommand('other-side')">
              <SvgIcon name="ep:close" />
            </button>
            <button class="button" :disabled="!tabbar.checkCloseLeftSide()" :title="t('app.tabbar.closeLeftSide')" @click="actionCommand('left-side')">
              <SvgIcon name="ph:arrow-line-left" />
            </button>
            <button class="button" :disabled="!tabbar.checkCloseRightSide()" :title="t('app.tabbar.closeRightSide')" @click="actionCommand('right-side')">
              <SvgIcon name="ph:arrow-line-right" />
            </button>
          </div>
          <OverlayScrollbarsComponent :options="{ scrollbars: { autoHide: 'leave', autoHideDelay: 300 } }" defer class="max-h-[300px]">
            <TransitionGroup ref="dropdownTabContainerRef" :name="!isDragging ? 'dropdown-tab' : undefined" tag="div" class="tabs" :class="{ dragging: isDragging }">
              <div
                v-for="element in tabbarStore.list" :key="element.tabId" class="tab" :class="{
                  'actived': element.tabId === activedTabId,
                  'no-drag': element.isPermanent || element.isPin,
                }"
              >
                <div :key="element.tabId" class="title" :title="element.customTitleList.find(item => item.fullPath === element.fullPath)?.title || generateI18nTitle(element.i18n, element.title)" @click="router.push(element.fullPath)">
                  <SvgIcon v-if="settingsStore.settings.tabbar.enableIcon && iconName(element.tabId === activedTabId, element.icon, element.activeIcon)" :name="iconName(element.tabId === activedTabId, element.icon, element.activeIcon)!" />
                  {{ element.customTitleList.find(item => item.fullPath === element.fullPath)?.title || generateI18nTitle(element.i18n, element.title) }}
                </div>
                <SvgIcon v-if="!element.isPermanent && element.isPin" name="ri:pushpin-2-fill" class="action-icon" @click.stop="tabbarStore.unPin(element.tabId)" />
                <SvgIcon v-else-if="!element.isPermanent && tabbarStore.list.length > 1" name="ri:close-fill" class="action-icon" @click.stop="tabbar.closeById(element.tabId)" />
              </div>
            </TransitionGroup>
          </OverlayScrollbarsComponent>
        </template>
      </HDropdown>
    </div>
  </div>
</template>

<style lang="scss">
.mx-menu-ghost-host {
  z-index: 1000;

  .mx-context-menu {
    --at-apply: fixed ring-1 ring-stone-2 dark:ring-stone-7 shadow-2xl;

    background-color: var(--g-container-bg);

    .mx-context-menu-items .mx-context-menu-item {
      --at-apply: transition-background-color;

      &:not(.disabled):hover {
        --at-apply: cursor-pointer bg-stone-1 dark:bg-stone-9;
      }

      span {
        color: initial;
      }

      .icon {
        width: 1em;
        margin-right: 10px;
        color: initial;
      }

      &.disabled span,
      &.disabled .icon {
        opacity: 0.25;
      }
    }

    .mx-context-menu-item-sperator {
      background-color: var(--g-container-bg);

      &::after {
        --at-apply: bg-stone-2 dark:bg-stone-7;
      }
    }
  }
}

.tabbar-dropdown {
  .quick-button {
    padding: 15px 15px 10px;
    display: flex;
    align-items: center;

    .button {
      --at-apply: transition-colors;

      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-right: 10px;
      border-radius: 5px;
      cursor: pointer;
      outline: none;
      border: none;
      background-color: var(--g-bg);

      &:hover:not(:disabled) {
        --at-apply: text-ui-primary;
      }

      &:disabled {
        cursor: not-allowed;
      }

      .icon {
        font-size: 14px;
      }
    }
  }

  .tabs {
    width: 200px;
    padding: 0 0 10px;

    &:not(.dragging) {
      .tab:hover {
        &:not(.actived) {
          background-color: var(--g-bg);
        }

        .action-icon {
          opacity: 1;
        }
      }
    }

    .tab {
      position: relative;
      width: calc(100% - 30px);
      height: 30px;
      margin: 0 15px;
      padding: 0 5px;
      border-radius: 5px;
      transition: background-color 0.3s;

      &.actived {
        background-color: var(--g-bg);
      }

      &.ghost {
        opacity: 0;
      }

      &:hover {
        .title {
          --at-apply: opacity-100;

          margin-right: 20px;
          mask-image: linear-gradient(to right, #000 calc(100% - 44px), transparent);
        }
      }

      * {
        user-select: none;
      }

      .title {
        --at-apply: opacity-70 transition;

        position: relative;
        display: flex;
        align-items: center;
        height: 100%;
        font-size: 14px;
        overflow: hidden;
        white-space: nowrap;
        cursor: pointer;
        mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent);

        i {
          margin-right: 5px;
          font-size: 16px;
        }
      }

      .action-icon {
        --at-apply: transition;

        position: absolute;
        z-index: 10;
        top: 50%;
        right: 6px;
        margin-top: -9px;
        width: 1.5em;
        height: 1.5em;
        border-radius: 50%;
        font-size: 12px;
        opacity: 0;
        pointer-events: all;
        color: var(--g-tabbar-tab-color);

        &:hover {
          --at-apply: ring-1 ring-stone-3 dark:ring-stone-7;

          background-color: var(--g-bg);
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
:deep([data-overlayscrollbars-viewport]) {
  overscroll-behavior: contain;
}

.tabbar-container {
  position: relative;
  height: var(--g-tabbar-height);
  background-color: var(--g-bg);
  transition: background-color 0.3s;

  .tabs {
    position: absolute;
    left: 0;
    right: 0;
    padding-right: 50px;
    overflow-y: hidden;
    white-space: nowrap;

    // firefox隐藏滚动条
    scrollbar-width: none;

    // chrome隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }

    &.tabs-ontop {
      top: 0 !important;
      bottom: inherit !important;
    }

    .tab-container {
      display: inline-block;

      &:not(.dragging) {
        .tab {
          &:not(.actived):hover {
            z-index: 3;

            &::before,
            &::after {
              content: none;
            }

            .tab-content {
              .title,
              .action-icon {
                color: var(--g-tabbar-tab-hover-color);
              }
            }
          }
        }
      }

      .tab {
        position: relative;
        display: inline-block;
        max-width: var(--g-tabbar-tab-max-width);
        min-width: var(--g-tabbar-tab-min-width);
        height: var(--g-tabbar-height);
        line-height: calc(var(--g-tabbar-height) - 2px);
        vertical-align: bottom;
        font-size: 14px;
        cursor: pointer;
        pointer-events: none;

        * {
          user-select: none;
        }

        &.actived {
          z-index: 5;

          &::before,
          &::after {
            content: none;
          }

          .tab-content {
            .title,
            .action-icon {
              color: var(--g-tabbar-tab-active-color);
            }
          }
        }

        &.tab-ghost {
          opacity: 0 !important;
        }

        .tab-dividers {
          position: absolute;
          z-index: 0;
          height: 14px;
          top: 50%;
          left: 0;
          right: 0;
          margin-top: -7px;

          &::before {
            content: "";
            display: block;
            position: absolute;
            top: 0;
            left: 1px;
            bottom: 0;
            width: 1px;
            opacity: 1;
            background-color: var(--g-tabbar-dividers-bg);
            transition: opacity 0.2s ease, background-color 0.3s;
          }
        }

        &:first-child .tab-dividers::before {
          opacity: 0;
        }

        .tab-background {
          position: absolute;
          z-index: 0;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .tab-content {
          width: 100%;
          height: 100%;
          display: flex;
          pointer-events: all;

          .title {
            display: flex;
            align-items: center;
            height: 100%;
            padding: 0 10px;
            margin-right: 10px;
            flex: 1;
            overflow: hidden;
            white-space: nowrap;
            mask-image: linear-gradient(to right, #000 calc(100% - 20px), transparent);
            color: var(--g-tabbar-tab-color);
            transition: margin-right 0.3s;

            &:has(+ .action-icon) {
              margin-right: 28px;
            }

            .icon {
              margin-right: 5px;
            }
          }

          .action-icon {
            position: absolute;
            z-index: 10;
            top: 50%;
            right: 0.5em;
            transform: translateY(-50%);
            width: 1.5em;
            height: 1.5em;
            border-radius: 50%;
            font-size: 12px;
            color: var(--g-tabbar-tab-color);

            &:hover {
              --at-apply: ring-1 ring-stone-3 dark:ring-stone-7;

              background-color: var(--g-bg);
            }
          }

          .hotkey-number {
            --at-apply: ring-1 ring-stone-3 dark:ring-stone-7;

            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            z-index: 10;
            top: 50%;
            right: 0.5em;
            transform: translateY(-50%);
            width: 1.5em;
            height: 1.5em;
            border-radius: 50%;
            font-size: 12px;
            color: var(--g-tabbar-tab-color);
            background-color: var(--g-bg);
          }

          .drag-handle {
            position: absolute;
            z-index: 9;
            inset: 0;
          }
        }
      }
    }

    &.tabs-fashion {
      bottom: -1px;

      .tab-container {
        &:not(.dragging) {
          .tab:not(.actived):hover {
            & + .tab .tab-dividers::before {
              opacity: 0;
            }

            .tab-background {
              opacity: 1;

              &::before,
              &::after {
                box-shadow: 0 0 0 20px var(--g-tabbar-tab-hover-bg);
              }
            }
          }
        }

        .tab {
          height: calc(var(--g-tabbar-height) - 10px);
          line-height: calc(var(--g-tabbar-height) - 12px);
          margin-left: 10px;
          margin-right: -10px;

          &:last-child {
            margin-right: 0;
          }

          &.tab-ontop .tab-background {
            transform: rotate(180deg);
          }

          &:not(.actived) .tab-background {
            opacity: 0;
          }

          .tab-background {
            border-radius: 10px 10px 0 0;
            background-color: var(--g-tabbar-tab-hover-bg);
            transition: opacity 0.3s, background-color 0.3s;

            &::before,
            &::after {
              content: "";
              position: absolute;
              bottom: 0;
              width: 20px;
              height: 20px;
              border-radius: 100%;
              box-shadow: 0 0 0 20px transparent;
              transition: box-shadow 0.3s;
            }

            &::before {
              left: -20px;
              clip-path: inset(50% -10px 0 50%);
            }

            &::after {
              right: -20px;
              clip-path: inset(50% 50% 0 -10px);
            }
          }

          &.actived {
            & + .tab .tab-dividers::before {
              opacity: 0;
            }

            .tab-background {
              opacity: 1;
              background-color: var(--g-container-bg);

              &::before,
              &::after {
                box-shadow: 0 0 0 20px var(--g-container-bg);
              }
            }
          }
        }
      }
    }

    &.tabs-card {
      .tab-container {
        &:not(.dragging) {
          .tab:not(.actived):hover {
            .tab-background {
              background-color: var(--g-tabbar-tab-hover-bg);
            }
          }
        }

        .tab {
          height: calc(var(--g-tabbar-height) - 10px);
          line-height: calc(var(--g-tabbar-height) - 12px);
          margin-top: 5px;
          margin-left: 5px;

          .tab-dividers {
            display: none;
          }

          .tab-background {
            border-radius: 5px;
            transition: background-color 0.3s;
          }

          &.actived {
            .tab-background {
              background-color: var(--g-container-bg);
            }
          }
        }
      }
    }

    &.tabs-square {
      .tab-container {
        &:not(.dragging) {
          .tab:not(.actived):hover {
            & + .tab .tab-dividers::before {
              opacity: 0;
            }

            .tab-background {
              &::before {
                height: 100%;
                background-color: var(--g-tabbar-tab-hover-bg);
              }
            }
          }
        }

        .tab {
          .tab-dividers {
            left: -1px;
            right: -1px;
          }

          &.tab-ontop .tab-background {
            transform: rotateX(180deg);
          }

          .tab-background {
            &::before {
              content: "";
              transition: background-color 0.3s;
              position: absolute;
              width: 100%;
              height: 0;
              bottom: 0;
            }

            &::after {
              content: "";
              transition: transform 0.3s;
              position: absolute;
              width: 100%;
              height: 2px;
              left: 0;
              bottom: 0;
              background-color: var(--g-theme-color);
              transform: scaleX(0);
              transform-origin: bottom right;
            }
          }

          &.actived {
            & + .tab .tab-dividers::before {
              opacity: 0;
            }

            .tab-background {
              &::before {
                height: calc(100% - 2px);
                bottom: 2px;
                background-color: var(--g-container-bg);
              }

              &::after {
                transform: scaleX(1);
                transform-origin: bottom left;
              }
            }
          }
        }
      }
    }
  }

  .more-action {
    position: absolute;
    z-index: 10;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 50px;
    background-image: linear-gradient(to right, transparent, var(--g-bg));

    .icon {
      --at-apply: w-6 h-6 rounded-1 text-lg cursor-pointer shadow transition-background-color transition-shadow;

      background-color: var(--g-container-bg);
    }
  }
}

// 标签栏动画
.tabs {
  .tabbar-enter-from,
  .tabbar-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

  &.tabs-ontop {
    .tabbar-enter-from,
    .tabbar-leave-to {
      opacity: 0;
      transform: translateY(-30px);
    }
  }

  .tabbar-enter-active {
    transition: all 0.3s;
  }

  .tabbar-leave-active {
    position: absolute !important;
    transition: all 0.3s;
  }

  .tabbar-move {
    transition: transform 0.3s;
  }
}

.tabbar-dropdown {
  .dropdown-tab-enter-from,
  .dropdown-tab-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  .dropdown-tab-enter-active {
    transition: all 0.3s;
  }

  .dropdown-tab-leave-active {
    position: absolute !important;
    transition: all 0.3s;
  }

  .dropdown-tab-move {
    transition: transform 0.3s;
  }
}
</style>
