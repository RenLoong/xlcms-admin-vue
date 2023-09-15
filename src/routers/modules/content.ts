export default [
    {
        path: '/regions/list',
        name: 'regions',
        component: () => import('@/pages/regions/index.vue'),
        meta: {
            title: '地区列表'
        }
    },
]