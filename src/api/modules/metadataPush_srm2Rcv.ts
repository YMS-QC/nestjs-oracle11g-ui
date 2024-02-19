import api from '../index'

export default {
  list: (data: {
    title?: string
    from: number
    limit: number
  }) => api.get('metadata_push/srm2_rcv/list', {
    params: data,
    baseURL: '/mock/',
  }),

  detail: (id: number | string) => api.get('metadata_push/srm2_rcv/detail', {
    params: {
      id,
    },
    baseURL: '/mock/',
  }),

  create: (data: any) => api.post('metadata_push/srm2_rcv/create', data, {
    baseURL: '/mock/',
  }),

  edit: (data: any) => api.post('metadata_push/srm2_rcv/edit', data, {
    baseURL: '/mock/',
  }),

  delete: (id: number | string) => api.post('metadata_push/srm2_rcv/delete', {
    id,
  }, {
    baseURL: '/mock/',
  }),

  // 实际使用

  queueStatus: () => api.post('/basic-data/srm2-rcv/queueStatus'),
  profile: () => api.post('/basic-data/srm2-rcv/profile'),
  stop: () => api.post('/basic-data/srm2-rcv/stop'),
  start: (data: any) => api.post('/basic-data/srm2-rcv/start', data),
}
