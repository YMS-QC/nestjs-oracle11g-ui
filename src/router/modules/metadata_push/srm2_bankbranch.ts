import type { RouteRecordRaw } from 'vue-router'

// const Layout = () => import('@/layouts/index.vue')

const routes: RouteRecordRaw = {
  path: '/srm2-bankbranch',
  name: 'srm2-bankbranch',
  meta: {
    title: '银行支行',
  },
  component: () => import('@/views/metadata_push/srm2_bankbranch/control.vue'),

}

export default routes
