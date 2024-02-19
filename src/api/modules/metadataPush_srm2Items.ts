import api from '../index'

export default {
  list: (data: {
    title?: string
    from: number
    limit: number
  }) => api.get('metadata_push/srm2_items/list', {
    params: data,
    baseURL: '/mock/',
  }),

  detail: (id: number | string) => api.get('metadata_push/srm2_items/detail', {
    params: {
      id,
    },
    baseURL: '/mock/',
  }),

  create: (data: any) => api.post('metadata_push/srm2_items/create', data, {
    baseURL: '/mock/',
  }),

  edit: (data: any) => api.post('metadata_push/srm2_items/edit', data, {
    baseURL: '/mock/',
  }),

  delete: (id: number | string) => api.post('metadata_push/srm2_items/delete', {
    id,
  }, {
    baseURL: '/mock/',
  }),

  // 实际使用

  queueStatus: () => api.post('/basic-data/srm2-items/queueStatus'),
  profile: () => api.post('/basic-data/srm2-items/profile'),
  stop: () => api.post('/basic-data/srm2-items/stop'),
  start: (data: any) => api.post('/basic-data/srm2-items/start', data),
}
