import { defaultsDeep } from 'lodash-es'
import type { RouteLocationNormalized, RouteMeta } from 'vue-router'
import type { Settings } from '#/global'
import { getLocales } from '@/locales'
import settingsDefault from '@/settings'

const useSettingsStore = defineStore(
  // 唯一ID
  'settings',
  () => {
    const settings = ref(settingsDefault)
    watch([
      () => settings.value.app.colorScheme,
      () => settings.value.app.lightTheme,
      () => settings.value.app.darkTheme,
    ], ([colorScheme, lightTheme, darkTheme]) => {
      if (colorScheme === '') {
        colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      switch (colorScheme) {
        case 'light':
          document.documentElement.classList.remove('dark')
          document.body.setAttribute('data-theme', lightTheme)
          break
        case 'dark':
          document.documentElement.classList.add('dark')
          document.body.setAttribute('data-theme', darkTheme)
          break
      }
    }, {
      immediate: true,
    })
    watch(() => settings.value.layout.widthMode, (val) => {
      document.body.setAttribute('data-app-width-mode', val)
    }, {
      immediate: true,
    })
    watch(() => settings.value.menu.menuMode, (val) => {
      document.body.setAttribute('data-menu-mode', val)
    }, {
      immediate: true,
    })

    // 操作系统
    const os = ref<'mac' | 'windows' | 'linux' | 'other'>('other')
    const agent = navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.includes('mac os'):
        os.value = 'mac'
        break
      case agent.includes('windows'):
        os.value = 'windows'
        break
      case agent.includes('linux'):
        os.value = 'linux'
        break
    }

    // 页面标题
    const title = ref<RouteMeta['title']>()
    // 记录页面标题
    function setTitle(_title: RouteMeta['title']) {
      title.value = _title
    }
    // 自定义标题
    const customTitleList = ref<{
      fullPath: RouteLocationNormalized['fullPath']
      title: string
    }[]>([])
    // 设置自定义标题
    function setCustomTitle(fullPath: RouteLocationNormalized['fullPath'], title: string) {
      const index = customTitleList.value.findIndex(item => item.fullPath === fullPath)
      if (index > -1) {
        customTitleList.value[index].title = title
      }
      else {
        customTitleList.value.push({
          fullPath,
          title,
        })
      }
    }
    // 重置自定义标题
    function resetCustomTitle(fullPath: RouteLocationNormalized['fullPath']) {
      const index = customTitleList.value.findIndex(item => item.fullPath === fullPath)
      if (index > -1) {
        customTitleList.value.splice(index, 1)
      }
    }

    // 显示模式
    const mode = ref<'pc' | 'mobile'>('pc')
    // 设置显示模式
    function setMode(width: number) {
      if (settings.value.layout.enableMobileAdaptation) {
        // 先判断 UA 是否为移动端设备（手机&平板）
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          mode.value = 'mobile'
        }
        else {
          // 如果是桌面设备，则根据页面宽度判断是否需要切换为移动端展示
          mode.value = width < 992 ? 'mobile' : 'pc'
        }
      }
      else {
        mode.value = 'pc'
      }
    }

    // 次导航是否收起（用于记录 pc 模式下最后的状态）
    const subMenuCollapseLastStatus = ref(settingsDefault.menu.subMenuCollapse)
    // 切换侧边栏导航展开/收起
    function toggleSidebarCollapse() {
      settings.value.menu.subMenuCollapse = !settings.value.menu.subMenuCollapse
      if (mode.value === 'pc') {
        subMenuCollapseLastStatus.value = !subMenuCollapseLastStatus.value
      }
    }

    watch(mode, (val) => {
      switch (val) {
        case 'pc':
          settings.value.menu.subMenuCollapse = subMenuCollapseLastStatus.value
          break
        case 'mobile':
          settings.value.menu.subMenuCollapse = true
          break
      }
      document.body.setAttribute('data-mode', val)
    }, {
      immediate: true,
    })

    // 当前语言
    const lang = computed(() => {
      // 如果没设置默认语言，则返回当前浏览器语言设置默认语言
      if (settings.value.app.defaultLang === '') {
        const lang = navigator.language.toLowerCase()
        const locales = getLocales()
        if (locales?.[lang]) {
          return lang
        }
      }
      return settings.value.app.defaultLang || 'zh-cn'
    })
    // 设置默认语言
    function setDefaultLang(lang: string) {
      settings.value.app.defaultLang = lang
    }

    // 设置主题颜色模式
    function setColorScheme(color: Required<Settings.app>['colorScheme']) {
      settings.value.app.colorScheme = color
    }

    // 主页面是否最大化
    const mainPageMaximizeStatus = ref(false)
    // 切换当前主页面最大化
    function setMainPageMaximize(value?: boolean) {
      mainPageMaximizeStatus.value = value ?? !mainPageMaximizeStatus.value
    }

    // 更新应用配置
    function updateSettings(data: Settings.all, fromBase = false) {
      settings.value = defaultsDeep(data, fromBase ? settingsDefault : settings.value)
    }

    return {
      settings,
      os,
      title,
      setTitle,
      customTitleList,
      setCustomTitle,
      resetCustomTitle,
      mode,
      setMode,
      subMenuCollapseLastStatus,
      toggleSidebarCollapse,
      lang,
      setDefaultLang,
      setColorScheme,
      mainPageMaximizeStatus,
      setMainPageMaximize,
      updateSettings,
    }
  },
)

export default useSettingsStore
