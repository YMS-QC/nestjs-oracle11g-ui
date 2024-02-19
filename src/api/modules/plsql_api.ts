import api from '../index'

export default {
  list: (data: {
    origName?: string
    page: number
    size: number
  }) => api.get('plsql/list', {
    params: data,
  }),

  detail: (id: number | string) => api.get('plsql/detail', {
    params: {
      id,
    },
  }),

  create: (data: any) => api.post('plsql/registRestful', data, {
    // baseURL: '/mock/',
  }),

  edit: (data: any) => api.post('plsql/edit', data, {
    // baseURL: '/mock/',
  }),

  invalid: (id: number | string) => api.get('plsql/invalid', {
    params: {
      id,
    },
  },
  ),
  regist: (id: number | string) => api.get('plsql/regist', {
    params: {
      id,
    },
  },
  ),
  // 任务队列
  listJob: () => api.post('/plsql/listJob'),
  pauseQueue: () => api.post('/plsql/pauseQueue'),
  resumeQueue: () => api.post('/plsql/resumeQueue'),
  getJobLogs: (id: number | string) => api.get('plsql/getJobLogs', {
    params: {
      id,
    },
  }),
  queueStatus: () => api.post('/plsql/queueStatus'),
}
