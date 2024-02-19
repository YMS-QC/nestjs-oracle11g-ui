import Mock from 'mockjs'

const AllList: any[] = []
for (let i = 0; i < 50; i++) {
  AllList.push(Mock.mock({
    id: '@id',
    title: '@ctitle(10, 20)',
  }))
}

export default [
  {
    url: '/mock/metadata_push/srm2_items/list',
    method: 'get',
    response: (option: any) => {
      const { title, from, limit } = option.query
      const list = AllList.filter((item) => {
        return title ? item.title.includes(title) : true
      })
      const pageList = list.filter((item, index) => {
        return index >= ~~from && index < (~~from + ~~limit)
      })
      return {
        success: true,
        data: {
          list: pageList,
          total: list.length,
        },
      }
    },
  },
  {
    url: '/mock/metadata_push/srm2_items/detail',
    method: 'get',
    response: (option: any) => {
      const info = AllList.filter(item => item.id === option.query.id)
      return {
        success: true,

        data: info[0],
      }
    },
  },
  {
    url: '/mock/metadata_push/srm2_items/create',
    method: 'post',
    response: {
      success: true,

      data: {
        isSuccess: true,
      },
    },
  },
  {
    url: '/mock/metadata_push/srm2_items/edit',
    method: 'post',
    response: {
      success: true,

      data: {
        isSuccess: true,
      },
    },
  },
  {
    url: '/mock/metadata_push/srm2_items/delete',
    method: 'post',
    response: {
      success: true,
      data: {
        isSuccess: true,
      },
    },
  },
]
