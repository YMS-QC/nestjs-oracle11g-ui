import type { RouteRecordRaw } from 'vue-router'

// const Layout = () => import('@/layouts/index.vue')

const routes: RouteRecordRaw = {
  path: '/srm2-bdgorg',
  // component: Layout,
  // redirect: '/srm2-bdgorgs/list',
  name: 'srm2-bdgorg',
  meta: {
    title: '预算组织',
  },
  component: () => import('@/views/metadata_push/srm2_bdgorg/control.vue'),
  // children: [
  //   {
  //     path: 'control',
  //     name: 'srm2-bdgorgsControl',
  //     component: () => import('@/views/metadata_push/srm2_bdgorg/control.vue'),
  //     meta: {
  //       title: '推送控制',
  //     },
  //   },
  // ],
}

export default routes
