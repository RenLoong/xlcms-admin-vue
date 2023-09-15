export default [
    {
        path: '/client/api',
        name: 'clientApi',
        component: () => import('@/pages/client/api.vue'),
        meta: {
            title: '接口'
        }
    },
]