import api from '../index'

export default {
  list: () => api.post('/basic-data/srm2-bank/list'),
  start: () => api.post('/basic-data/srm2-bank/start'),
}
