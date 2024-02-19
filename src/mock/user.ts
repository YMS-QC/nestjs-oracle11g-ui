export default [
  {
    url: '/mock/user/login',
    method: 'post',
    response: ({ body }: any) => {
      return {
        error: '',
        status: 1,
        data: {
          account: body.account,
          token: `${body.account}_@string`,
          avatar: '',
        },
      }
    },
  },
  {
    url: '/mock/user/permission',
    method: 'get',
    response: ({ headers }: any) => {
      let permissions: string[] = []
      if (headers.token.indexOf('admin') === 0) {
        permissions = [
          'permission.browse',
          'permission.create',
          'permission.edit',
          'permission.remove',
        ]
      }
      else if (headers.token.indexOf('test') === 0) {
        permissions = [
          'permission.browse',
        ]
      }
      return {
        error: '',
        status: 1,
        data: {
          permissions,
        },
      }
    },
  },
  {
    url: '/mock/user/password/edit',
    method: 'post',
    response: {
      error: '',
      status: 1,
      data: {
        isSuccess: true,
      },
    },
  },
  {
    url: '/mock/user/preferences',
    method: 'get',
    response: ({ headers }: any) => {
      let preferences: any = ''
      if (headers.token.indexOf('admin') === 0) {
        preferences = '{"app":{"colorScheme":"light"}}'
      }
      else if (headers.token.indexOf('test') === 0) {
        preferences = '{"app":{"colorScheme":"dark"},"menu":{"menuMode":"head","isRounded":false,"menuActiveStyle":""},"layout":{"widthMode":"center"},"tabbar":{"enable":false}}'
      }
      return {
        error: '',
        status: 1,
        data: {
          preferences,
        },
      }
    },
  },
  {
    url: '/mock/user/preferences/edit',
    method: 'post',
    response: {
      error: '',
      status: 1,
      data: {
        isSuccess: true,
      },
    },
  },
  {
    url: '/mock/user/tabbar',
    method: 'get',
    response: ({ headers }: any) => {
      let tabbar: any = ''
      if (headers.token.indexOf('admin') === 0) {
        tabbar = ''
      }
      return {
        error: '',
        status: 1,
        data: {
          tabbar,
        },
      }
    },
  },
  {
    url: '/mock/user/tabbar/edit',
    method: 'post',
    response: {
      error: '',
      status: 1,
      data: {
        isSuccess: true,
      },
    },
  },
  {
    url: '/mock/user/favorites',
    method: 'get',
    response: ({ headers }: any) => {
      let favorites: any = ''
      if (headers.token.indexOf('admin') === 0) {
        favorites = '[{"fullPath":"/multilevel_menu_example/page","title":"导航1","i18n":"route.multimenu.page","icon":"heroicons-solid:menu-alt-3"}]'
      }
      return {
        error: '',
        status: 1,
        data: {
          favorites,
        },
      }
    },
  },
  {
    url: '/mock/user/favorites/edit',
    method: 'post',
    response: {
      error: '',
      status: 1,
      data: {
        isSuccess: true,
      },
    },
  },
]
