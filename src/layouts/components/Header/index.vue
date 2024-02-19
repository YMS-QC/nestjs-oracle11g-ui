<script setup lang="ts">
import Logo from '../Logo/index.vue'
import Tools from '../Tools/index.vue'
import Menu from '../Menu/index.vue'
import useMenuStore from '@/store/modules/menu'
import useSettingsStore from '@/store/modules/settings'
import { i18nTitleInjectionKey } from '@/utils/injectionKeys'

defineOptions({
  name: 'LayoutHeader',
})

const route = useRoute()

const settingsStore = useSettingsStore()
const menuStore = useMenuStore()

const { switchTo } = useMenu()

const generateI18nTitle = inject(i18nTitleInjectionKey, Function, true)

function iconName(isActive: boolean, icon?: string, activeIcon?: string) {
  let name
  if ((!isActive && icon) || (isActive && !activeIcon)) {
    name = icon
  }
  else if (isActive && activeIcon) {
    name = activeIcon
  }
  return name
}

const menuRef = ref()

// 顶部模式鼠标滚动
function handlerMouserScroll(event: WheelEvent) {
  menuRef.value.scrollBy({
    left: (event.deltaY || event.detail) > 0 ? 50 : -50,
  })
}
</script>

<template>
  <Transition name="header">
    <header v-if="settingsStore.mode === 'pc' && ['head', 'only-head'].includes(settingsStore.settings.menu.menuMode)">
      <div class="header-container">
        <div class="main">
          <Logo class="title" />
          <div ref="menuRef" class="menu-container" @wheel.prevent="handlerMouserScroll">
            <!-- 顶部模式 -->
            <div
              v-if="settingsStore.settings.menu.menuMode === 'head'" class="menu flex of-hidden transition-all" :class="{
                [`menu-active-${settingsStore.settings.menu.menuActiveStyle}`]: settingsStore.settings.menu.menuActiveStyle !== '',
              }"
            >
              <template v-for="(item, index) in menuStore.allMenus" :key="index">
                <div
                  class="menu-item relative transition-all" :class="{
                    'active': index === menuStore.actived,
                    'px-1 py-2': settingsStore.settings.menu.isRounded,
                  }"
                >
                  <div
                    v-if="item.children && item.children.length !== 0" class="group menu-item-container h-full w-full flex cursor-pointer items-center justify-between gap-1 px-3 text-[var(--g-header-menu-color)] transition-all hover:(bg-[var(--g-header-menu-hover-bg)] text-[var(--g-header-menu-hover-color)])" :class="{
                      'text-[var(--g-header-menu-active-color)]! bg-[var(--g-header-menu-active-bg)]!': index === menuStore.actived,
                      'rounded-2': settingsStore.settings.menu.isRounded,
                    }" :title="generateI18nTitle(item.meta?.i18n, item.meta?.title)" @click="switchTo(index)"
                  >
                    <div class="inline-flex flex-1 items-center justify-center gap-1">
                      <SvgIcon v-if="iconName(index === menuStore.actived, item.meta?.icon, item.meta?.activeIcon)" :name="iconName(index === menuStore.actived, item.meta?.icon, item.meta?.activeIcon)!" :size="20" class="menu-item-container-icon transition-transform group-hover:scale-120" async />
                      <span class="w-full flex-1 truncate text-sm transition-height transition-opacity transition-width">
                        {{ generateI18nTitle(item.meta?.i18n, item.meta?.title) }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <!-- 顶部精简模式 -->
            <Menu
              v-else-if="settingsStore.settings.menu.menuMode === 'only-head'" :menu="menuStore.allMenus" :value="route.meta.activeMenu || route.path" mode="horizontal" show-collapse-name :rounded="settingsStore.settings.menu.isRounded" class="menu" :class="{
                [`menu-active-${settingsStore.settings.menu.menuActiveStyle}`]: settingsStore.settings.menu.menuActiveStyle !== '',
              }"
            />
          </div>
        </div>
        <Tools />
      </div>
    </header>
  </Transition>
</template>

<style lang="scss" scoped>
[data-app-width-mode="center"],
[data-app-width-mode="center-max-width"] {
  header {
    width: var(--g-app-width);
    max-width: 100%;
  }
}

header {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
  height: var(--g-header-height);
  color: var(--g-header-color);
  background-color: var(--g-header-bg);
  box-shadow: -1px 0 0 0 var(--g-border-color), 1px 0 0 0 var(--g-border-color), 0 1px 0 0 var(--g-border-color);
  transition: background-color 0.3s;

  .header-container {
    width: var(--g-header-width);
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .main {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      height: 100%;

      .menu-active {
        &-arrow {
          .item-container::before,
          :deep(.menu-item::before) {
            content: "";
            opacity: 0;
            bottom: 0;
            width: 0;
            height: 0;
            border-right: 5px solid transparent;
            border-left: 5px solid transparent;
            border-bottom: 5px solid var(--g-header-bg);
            transition: all 0.3s;

            @include position-center(x);
          }

          .item-container.active::before,
          :deep(.menu-item.active::before) {
            opacity: 1;
            bottom: 8px;
          }
        }

        &-line {
          .item-container::before,
          :deep(.menu-item::before) {
            content: "";
            opacity: 0;
            bottom: 6px;
            width: 0;
            height: 4px;
            border-radius: 2px;
            background-color: var(--g-header-menu-active-bg);
            box-shadow: 0 0 0 1px var(--g-header-bg);
            transition: all 0.3s;

            @include position-center(x);
          }

          .item-container.active::before,
          :deep(.menu-item.active::before) {
            opacity: 1;
            width: 20px;
          }
        }

        &-dot {
          .item-container::before,
          :deep(.menu-item::before) {
            content: "";
            opacity: 0;
            bottom: 0;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: var(--g-header-menu-active-bg);
            box-shadow: 0 0 0 1px var(--g-main-sidebar-bg);
            transition: all 0.3s;

            @include position-center(x);
          }

          .item-container.active::before,
          :deep(.menu-item.active::before) {
            opacity: 1;
            bottom: 4px;
          }
        }
      }
    }
  }

  @media screen and (max-width: $g-header-width) {
    .header-container {
      width: 100%;
    }
  }

  :deep(a.title) {
    position: relative;
    width: inherit;
    height: inherit;
    padding: inherit;
    background-color: inherit;

    .logo {
      width: initial;
      height: 40px;
    }

    span {
      font-size: 20px;
      letter-spacing: 1px;
      color: var(--g-header-color);
    }
  }

  .menu-container {
    flex: 1;
    margin: 0 30px;
    padding: 0 20px;
    height: 100%;
    overflow-x: auto;
    mask-image: linear-gradient(to right, transparent, #000 20px, #000 calc(100% - 20px), transparent);

    // firefox隐藏滚动条
    scrollbar-width: none;

    // chrome隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .menu {
    display: inline-flex;
    height: 100%;

    :deep(.menu-item) {
      .menu-item-container {
        color: var(--g-header-menu-color);

        &:hover {
          color: var(--g-header-menu-hover-color);
          background-color: var(--g-header-menu-hover-bg);
        }
      }

      &.active .menu-item-container {
        color: var(--g-header-menu-active-color) !important;
        background-color: var(--g-header-menu-active-bg) !important;
      }
    }
  }

  :deep(.tools) {
    padding: 0;
  }
}

// 头部动画
.header-enter-active,
.header-leave-active {
  transition: transform 0.3s;
}

.header-enter-from,
.header-leave-to {
  transform: translateY(calc(var(--g-header-height) * -1));
}
</style>
