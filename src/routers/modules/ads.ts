export default [
    {
        path: '/ads/seat',
        name: 'ads/seat',
        component: () => import('@/pages/ads/seat.vue'),
        meta: {
            title: '广告位'
        }
    },
    {
        path: '/ads/list',
        name: 'ads/list',
        component: () => import('@/pages/ads/list.vue'),
        meta: {
            title: '广告'
        }
    }
]