export default [
    {
        path: '/auth/index',
        name: 'authIndex',
        component: () => import('@/pages/auth/index.vue'),
        meta: {
            title: '权限'
        }
    },
    {
        path: '/role/index',
        name: 'role',
        component: () => import('@/pages/role/index.vue'),
        meta: {
            title: '角色'
        }
    },
    {
        path: '/admin/index',
        name: 'admin',
        component: () => import('@/pages/admin/index.vue'),
        meta: {
            title: '管理员'
        }
    }
]