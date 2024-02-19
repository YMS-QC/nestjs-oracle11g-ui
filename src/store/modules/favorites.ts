import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import useSettingsStore from './settings'
import useUserStore from './user'
import useRouteStore from './route'
import useMenuStore from './menu'
import apiUser from '@/api/modules/user'
import { resolveRoutePath } from '@/utils'
import storage from '@/utils/storage'
import type { Favorites, Menu } from '#/global'

const useFavoritesStore = defineStore(
  // 唯一ID
  'favorites',
  () => {
    const settingsStore = useSettingsStore()
    const userStore = useUserStore()
    const routeStore = useRouteStore()
    const menuStore = useMenuStore()

    const list = ref<Favorites.recordRaw[]>([])

    function hasChildren(item: RouteRecordRaw) {
      let flag = true
      if (item.children?.every(i => i.meta?.sidebar === false)) {
        flag = false
      }
      return flag
    }
    function getSourceList(arr: RouteRecordRaw[], basePath?: string) {
      const list: string[] = []
      arr.forEach((item) => {
        if (item.meta?.sidebar !== false) {
          if (item.children && hasChildren(item)) {
            list.push(...getSourceList(item.children, resolveRoutePath(basePath, item.path)))
          }
          else {
            list.push((item.redirect as string) ?? resolveRoutePath(basePath, item.path))
          }
        }
      })
      return list
    }
    function getSourceListByMenus(arr: Menu.recordRaw[]) {
      const list: string[] = []
      arr.forEach((item) => {
        if (item.children && item.children.length > 0) {
          list.push(...getSourceListByMenus(item.children))
        }
        else {
          list.push(item.path as string)
        }
      })
      return list
    }

    const flatSidebarMenu = computed(() => {
      const list: string[] = []
      if (settingsStore.settings.app.routeBaseOn !== 'filesystem') {
        routeStore.routes.forEach((item) => {
          item.children && list.push(...getSourceList(item.children as RouteRecordRaw[]))
        })
      }
      else {
        menuStore.menus.forEach((item) => {
          list.push(...getSourceListByMenus(item.children))
        })
      }
      return list
    })

    // 判断路由是否可添加进收藏夹
    function canAdd(fullPath: Favorites.recordRaw['fullPath']) {
      return flatSidebarMenu.value.includes(fullPath)
    }
    // 判断路由是否已经添加进收藏夹
    function isAdd(fullPath: Favorites.recordRaw['fullPath']) {
      return list.value.some(item => item.fullPath === fullPath)
    }
    // 新增收藏
    function add(route: RouteLocationNormalized) {
      const meta = route.matched.at(-1)?.meta
      if (!list.value.find(item => item.fullPath === route.fullPath)) {
        list.value.push({
          fullPath: route.fullPath,
          title: meta?.title,
          i18n: meta?.i18n,
          icon: meta?.icon ?? meta?.breadcrumbNeste?.findLast(item => item.icon)?.icon,
        })
      }
      updateStorage()
    }
    // 删除收藏
    function remove(fullPath: Favorites.recordRaw['fullPath']) {
      list.value = list.value.filter((item) => {
        return item.fullPath !== fullPath
      })
      updateStorage()
    }
    // 拖拽排序
    function sort(newIndex: number, oldIndex: number) {
      list.value.splice(newIndex, 0, list.value.splice(oldIndex, 1)[0])
      updateStorage()
    }
    // 更新 storage 数据
    async function updateStorage() {
      if (settingsStore.settings.favorites.storageTo === 'local') {
        const favoritesData = storage.local.has('favoritesData') ? JSON.parse(storage.local.get('favoritesData') as string) : {}
        favoritesData[userStore.account] = list.value
        storage.local.set('favoritesData', JSON.stringify(favoritesData))
      }
      else if (settingsStore.settings.favorites.storageTo === 'server') {
        await apiUser.favoritesEdit(JSON.stringify(list.value))
      }
    }
    // 根据 storage 数据复原当前帐号的标签页
    async function recoveryStorage() {
      if (settingsStore.settings.favorites.storageTo === 'local') {
        if (storage.local.has('favoritesData')) {
          list.value = JSON.parse(storage.local.get('favoritesData') as string)[userStore.account] || []
        }
      }
      else if (settingsStore.settings.favorites.storageTo === 'server') {
        const res = await apiUser.favorites()
        list.value = JSON.parse(res.data.favorites || '[]')
      }
    }

    return {
      list,
      canAdd,
      isAdd,
      add,
      remove,
      sort,
      recoveryStorage,
    }
  },
)

export default useFavoritesStore
