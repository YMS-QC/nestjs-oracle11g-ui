import type { RouteRecordRaw } from 'vue-router'

// const Layout = () => import('@/layouts/index.vue')

const routes: RouteRecordRaw = {
  path: '/srm2-items',
  component: () => import('@/views/metadata_push/srm2_items/control.vue'),
  // redirect: '/srm2-items/list',
  name: 'srm2-items',
  meta: {
    title: '物料推送',
  },
  // children: [
  //   {
  //     path: 'control',
  //     name: 'srm2-itemsControl',
  //     component: () => import('@/views/metadata_push/srm2_items/control.vue'),
  //     meta: {
  //       title: '推送控制',
  //     },
  //   },
  //   {
  //     path: 'list',
  //     name: 'srm2-itemsList',
  //     component: () => import('@/views/metadata_push/srm2_items/list.vue'),
  //     meta: {
  //       title: '历史记录',
  //     },
  //   },
  //   {
  //     path: 'create',
  //     name: 'srm2-itemsCreate',
  //     component: () => import('@/views/metadata_push/srm2_items/detail.vue'),
  //     meta: {
  //       title: '新增',
  //       sidebar: false,
  //       activeMenu: '/srm2-items/list',
  //     },
  //   },
  //   {
  //     path: 'edit/:id',
  //     name: 'srm2-itemsEdit',
  //     component: () => import('@/views/metadata_push/srm2_items/detail.vue'),
  //     meta: {
  //       title: '编辑',
  //       sidebar: false,
  //       activeMenu: '/srm2-items/list',
  //     },
  //   },
  // ],
}

export default routes
