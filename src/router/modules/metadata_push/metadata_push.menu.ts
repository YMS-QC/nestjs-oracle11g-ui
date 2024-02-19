import type { RouteRecordRaw } from 'vue-router'
import Srm2Bdgorgs from '@/router/modules/metadata_push/srm2_bdgorgs'
import Srm2CashPrj from '@/router/modules/metadata_push/srm2_cashprj'
import Srm2Bank from '@/router/modules/metadata_push/srm2_bank'
import Srm2Bankbranch from '@/router/modules/metadata_push/srm2_bankbranch'
import Srm2Items from '@/router/modules/metadata_push/srm2_items'
import Srm2Rcv from '@/router/modules/metadata_push/srm2_rcv'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/metadata_push',
  component: Layout,
  // redirect: '/metadata_push//srm2-items/list',
  name: 'metadataPush',
  meta: {
    title: 'SRM2数据推送',
    i18n: 'route.metadataPush.srm',
    icon: 'heroicons-solid:menu-alt-3',
  },
  children: [
    Srm2Bdgorgs,
    Srm2CashPrj,
    Srm2Bank,
    Srm2Bankbranch,
    Srm2Items,
    Srm2Rcv,
  ],
}

export default routes
