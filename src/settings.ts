import { defaultsDeep } from 'lodash-es'
import { tr } from 'element-plus/es/locales.mjs'
import type { RecursiveRequired, Settings } from '#/global'
import settingsDefault from '@/settings.default'

const globalSettings: Settings.all = {
  // 请在此处编写或粘贴配置代码
  app: {
    enablePermission: false,
    darkTheme: 'dark',
    lightTheme: 'light',
  },
  breadcrumb: {
    enable: false,
    enableMainMenu: true,
  },
  menu: {
    // isRounded: true,
    switchMainMenuAndPageJump: true,
    subMenuOnlyOneHide: true,
    enableSubMenuCollapseButton: true,
  },
  home: {
    enable: false,
  },
  topbar: {
    mode: 'sticky',
    switchTabbarAndToolbar: true,
  },
  tabbar: {
    enable: true,
    style: 'square',
  },
  toolbar: {
    enableColorScheme: true,
    // enableNotification: true,
    enableFullscreen: true,
    enablePageReload: true,
  },

}

export default defaultsDeep(globalSettings, settingsDefault) as RecursiveRequired<Settings.all>
