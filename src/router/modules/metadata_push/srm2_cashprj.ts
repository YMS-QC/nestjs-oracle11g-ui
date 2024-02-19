import type { RouteRecordRaw } from 'vue-router'

// const Layout = () => import('@/layouts/index.vue')

const routes: RouteRecordRaw = {
  path: '/srm2-cashprj',
  name: 'srm2-cashprj',
  meta: {
    title: '收支项目',
  },
  component: () => import('@/views/metadata_push/srm2_cashprj/control.vue'),

}

export default routes
