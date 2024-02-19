import api from '../index'

export default {
  list: (data: {
    origName?: string
    page: number
    size: number
  }) => api.get('plsql/listHis', {
    params: data,
  }),

  requestInfo: (id: number | string) => api.get('plsql/requestInfo', {
    params: {
      id,
    },
  }),

  // 以下自动生成，未修改

  detail: (id: number | string) => api.get('plsql/his/detail', {
    params: {
      id,
    },
    baseURL: '/mock/',
  }),

  create: (data: any) => api.post('plsql/his/create', data, {
    baseURL: '/mock/',
  }),

  edit: (data: any) => api.post('plsql/his/edit', data, {
    baseURL: '/mock/',
  }),

  delete: (id: number | string) => api.post('plsql/his/delete', {
    id,
  }, {
    baseURL: '/mock/',
  }),
}
