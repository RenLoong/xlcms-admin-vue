export default [
    {
        path: '/setting/basic',
        name: 'setting',
        component: () => import('@/pages/setting/basic.vue'),
        meta: {
            title: '配置'
        }
    },
    {
        path: '/setting/wechat',
        name: 'setting/wechat',
        component: () => import('@/pages/setting/wechat.vue'),
        meta: {
            title: '微信配置'
        }
    },
]