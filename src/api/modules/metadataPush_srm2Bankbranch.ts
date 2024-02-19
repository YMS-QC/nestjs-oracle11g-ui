import api from '../index'

export default {
  list: () => api.post('/basic-data/srm2-bankbranch/list'),
  start: () => api.post('/basic-data/srm2-bankbranch/start'),
}
