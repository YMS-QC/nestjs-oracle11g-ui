import type { RouteRecordRaw } from 'vue-router'

// const Layout = () => import('@/layouts/index.vue')

const routes: RouteRecordRaw = {
  path: '/srm2-bank',
  name: 'srm2-bank',
  meta: {
    title: '银行总行',
  },
  component: () => import('@/views/metadata_push/srm2_bank/control.vue'),

}

export default routes
