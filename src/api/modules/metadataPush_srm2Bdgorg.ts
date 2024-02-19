import api from '../index'

export default {
  list: () => api.post('/basic-data/srm2-bdgorg/list'),
  start: () => api.post('/basic-data/srm2-bdgorg/start'),
}
