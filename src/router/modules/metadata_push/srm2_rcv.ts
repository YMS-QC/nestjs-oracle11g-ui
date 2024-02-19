import type { RouteRecordRaw } from 'vue-router'

// const Layout = () => import('@/layouts/index.vue')

const routes: RouteRecordRaw = {
  path: '/srm2-rcv',
  component: () => import('@/views/metadata_push/srm2_rcv/control.vue'),
  name: 'srm2-rcv',
  meta: {
    title: '物料凭证',
  },

}

export default routes
