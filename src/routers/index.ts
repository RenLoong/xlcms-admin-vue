import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { useUserStore, useWebConfigStore } from "@/stores";
import { useStorage } from "@/common/common";
/**
 * meta.title 页面标题
 * meta.login false：未登录可访问
 * meta.login_access true：登录后不可访问
 * meta.showHeader false：不在页面tab栏显示
 * meta.componentName 自定义组件名称
 */
const modules = import.meta.glob('./modules/*.ts', {
    eager: true,
    import: 'default'
});
const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        component: () => import("@/pages/login/index.vue"),
        meta: {
            title: '登录',
            login: false,
            login_access: true
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import('@/pages/404.vue'),
        meta: {
            title: '404',
            login: false,
            showHeader: false
        }
    }
];
const mainRoute: RouteRecordRaw = {
    path: '/',
    name: 'main',
    redirect: '/index',
    component: () => import("@/pages/Main.vue"),
    meta: {
        showHeader: true
    },
    children: [
        {
            path: '/index',
            name: 'index',
            component: () => import("@/pages/index/index.vue"),
            meta: {
                title: '控制台',
            }
        }
    ]
};
/**
 * 自动导入路由模块
 */
Object.values(modules).map((item: any) => {
    Array.isArray(item) && mainRoute.children.push(...item);
})
routes.push(mainRoute);
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
router.beforeEach((to, from, next) => {
    const { WEBCONFIG } = useWebConfigStore();
    let webName = WEBCONFIG.siteinfo.name;
    let subTitle = '';
    if (webName) {
        subTitle = ` - ${webName}`;
    }
    globalThis.document.title = `${to.meta?.title}${subTitle}`
    const storage = useStorage()
    const { hasLogin } = useUserStore()
    /**
     * 判断是否登录
     */
    if (hasLogin()) {
        if (from.name === 'login') {
            // 读取并判断是否有未登录访问目标地址
            const login_redirect_url = storage.getOnce('login_redirect_url');
            if (login_redirect_url !== null) {
                return next(login_redirect_url as string);
            }
        }
        // 判断当前跳转是否为已登录不可访问地址
        if (to.meta.login_access) {
            return next('/');
        }
    } else {
        if (to.meta?.login !== false) {
            // 储存未登录访问目标地址
            storage.set('login_redirect_url', to.fullPath);
            return next('/login');
        }
    }
    return next();
})
export default router