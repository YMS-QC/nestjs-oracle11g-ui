import useSettingsStore from './settings'
import useTabbarStore from './tabbar'
import useRouteStore from './route'
import useMenuStore from './menu'
import router from '@/router'
import apiUser from '@/api/modules/user'
import storage from '@/utils/storage'

const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {
    const settingsStore = useSettingsStore()
    const tabbarStore = useTabbarStore()
    const routeStore = useRouteStore()
    const menuStore = useMenuStore()

    const account = ref(storage.local.get('account') ?? '')
    const token = ref(storage.local.get('token') ?? '')
    const expiresAt = ref(storage.local.get('expiresAt') ?? '')
    const avatar = ref(storage.local.get('avatar') ?? '')
    const permissions = ref<string[]>([])

    const isLogin = computed(() => {
      let retn = false
      if (token.value) {
        if (new Date().getTime() < Number(expiresAt.value)) {
          retn = true
        }
      }
      return retn
    })

    function isExpired(): boolean {
      let retn = false
      if (new Date().getTime() > Number(expiresAt.value)) {
        retn = true
      }
      return retn
    }

    // 登录
    async function login(data: {
      account: string
      password: string
    }) {
      const res = await apiUser.login(data)
      //
      storage.local.set('account', res.data.account)
      storage.local.set('token', res.data.token)
      storage.local.set('expiresAt', res.data.expiresAt)
      storage.local.set('avatar', res.data.avatar)
      //
      account.value = res.data.account
      token.value = res.data.token
      expiresAt.value = res.data.expiresAt
      avatar.value = res.data.avatar
    }
    // 登出
    async function logout(redirect = router.currentRoute.value.fullPath) {
      storage.local.remove('account')
      storage.local.remove('token')
      storage.local.remove('avatar')
      account.value = ''
      token.value = ''
      expiresAt.value = ''
      avatar.value = ''
      permissions.value = []
      tabbarStore.clean()
      routeStore.removeRoutes()
      menuStore.setActived(0)
      router.push({
        name: 'login',
        query: {
          ...(router.currentRoute.value.path !== settingsStore.settings.home.fullPath && router.currentRoute.value.name !== 'login' && { redirect }),
        },
      })
    }
    // 获取权限
    async function getPermissions() {
      const res = await apiUser.permission()
      permissions.value = res.data.permissions
      return permissions.value
    }
    // 获取偏好设置
    async function getPreferences() {
      const res = await apiUser.preferences()
      settingsStore.updateSettings(JSON.parse(res.data.preferences || '{}'), true)
    }
    // 修改密码
    async function editPassword(data: {
      password: string
      newpassword: string
    }) {
      await apiUser.passwordEdit(data)
    }

    return {
      account,
      token,
      avatar,
      permissions,
      isLogin,
      login,
      logout,
      getPermissions,
      getPreferences,
      editPassword,
      isExpired,
    }
  },
)

export default useUserStore
