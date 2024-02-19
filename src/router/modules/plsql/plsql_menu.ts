import type { RouteRecordRaw } from 'vue-router'

const Layout = () => import('@/layouts/index.vue')

const routes: RouteRecordRaw = {
  path: '/plsql',
  component: Layout,
  redirect: '/plsql/list',
  name: 'plsql',
  meta: {
    title: '接口管理',
  },
  children: [
    // 接口管理
    {
      path: 'list',
      name: 'plsqlList',
      component: () => import('@/views/plsql/api/list.vue'),
      meta: {
        title: '接口列表',
      },
    },
    {
      path: 'create',
      name: 'plsqlCreate',
      component: () => import('@/views/plsql/api/detail.vue'),
      meta: {
        title: '新增',
        sidebar: false,
        activeMenu: '/plsql/list',
      },
    },
    {
      path: 'edit/:id',
      name: 'plsqlEdit',
      component: () => import('@/views/plsql/api/detail.vue'),
      meta: {
        title: '编辑',
        sidebar: false,
        activeMenu: '/plsql/list',
      },
    },
    // 注册队列管理
    {
      path: 'queue',
      name: 'plsqlQueue',
      component: () => import('@/views/plsql/api/queue.vue'),
      meta: {
        title: '注册队列',
      },
    },
    // 调用记录
    // 接口管理
    {
      path: 'plsqlHisList',
      name: 'plsqlHisList',
      component: () => import('@/views/plsql/his/list.vue'),
      meta: {
        title: '调用记录',
      },
    },

  ],
}

export default routes
