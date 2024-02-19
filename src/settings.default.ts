// 该文件为系统默认配置，请勿修改！！！

import type { RecursiveRequired, Settings } from '#/global'

const globalSettingsDefault: RecursiveRequired<Settings.all> = {
  app: {
    lightTheme: 'light',
    darkTheme: 'dark',
    colorScheme: 'light',
    defaultLang: '',
    enablePermission: false,
    enableProgress: true,
    enableDynamicTitle: false,
    storagePrefix: 'fa_',
    enableWatermark: false,
    enableErrorLog: false,
    routeBaseOn: 'frontend',
    enableUserPreferences: false,
  },
  home: {
    enable: true,
    title: '主页',
    fullPath: '/',
  },
  layout: {
    widthMode: 'adaption',
    enableMobileAdaptation: false,
  },
  menu: {
    baseOn: 'frontend',
    menuMode: 'side',
    isRounded: false,
    menuActiveStyle: '',
    switchMainMenuAndPageJump: false,
    subMenuUniqueOpened: true,
    subMenuOnlyOneHide: false,
    subMenuCollapse: false,
    enableSubMenuCollapseButton: false,
    enableHotkeys: false,
  },
  topbar: {
    mode: 'static',
    switchTabbarAndToolbar: false,
  },
  tabbar: {
    enable: false,
    style: 'fashion',
    enableIcon: false,
    mergeTabsBy: '',
    enableMemory: false,
    enableHotkeys: false,
    storageTo: 'local',
  },
  toolbar: {
    enableNotification: false,
    enableI18n: false,
    enableFullscreen: false,
    enablePageReload: false,
    enableColorScheme: false,
  },
  favorites: {
    enable: false,
    storageTo: 'local',
  },
  breadcrumb: {
    enable: true,
    style: '',
    enableMainMenu: false,
  },
  mainPage: {
    enableHotkeys: true,
    iframeCacheMax: 3,
    enableTransition: true,
    transitionMode: 'fade',
  },
  navSearch: {
    enable: true,
    enableHotkeys: true,
  },
  copyright: {
    enable: false,
    dates: '',
    company: '',
    website: '',
    beian: '',
  },
}

export default globalSettingsDefault
