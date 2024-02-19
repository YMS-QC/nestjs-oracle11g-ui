import api from '../index'

export default {
  list: () => api.post('/basic-data/srm2-cashprj/list'),
  start: () => api.post('/basic-data/srm2-cashprj/start'),
}
