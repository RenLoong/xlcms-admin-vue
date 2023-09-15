export default [
    {
        path: '/article/classify',
        name: 'article/classify',
        component: () => import('@/pages/article/classify.vue'),
        meta: {
            title: '文章分类'
        }
    },
    {
        path: '/article/index',
        name: 'article/index',
        component: () => import('@/pages/article/index.vue'),
        meta: {
            title: '文章'
        }
    },
    {
        path: '/article/agree',
        name: 'article/agree',
        component: () => import('@/pages/article/agree.vue'),
        meta: {
            title: '协议'
        }
    },
    {
        path: '/article/notice',
        name: 'article/notice',
        component: () => import('@/pages/article/notice.vue'),
        meta: {
            title: '公告'
        }
    },
    {
        path: '/article/publish',
        name: 'article/publish',
        component: () => import('@/pages/article/publish.vue'),
        meta: {
            title: '发布文章'
        }
    }
]