<script setup lang="ts">
import router from "@/routers";
import { useStorage } from '@/common/common';
import { useUserStore, useRefs, useWebConfigStore } from "@/stores";
import useTheme from "@/common/theme";
const { theme } = useTheme();
const props = withDefaults(defineProps<{
    theme?: 'light' | 'dark' | 'transparent'
    placeholder?: boolean
}>(), {
    placeholder: true
});
const storage = useStorage()
const userStore = useUserStore()
const { USERINFO } = useRefs(userStore)
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const UserHeaderEventMap = ref<UserHeaderEventMapInterface[]>([]);
UserHeaderEventMap.value.push({
    key: 'username',
    title: '账户:' + USERINFO.value?.username,
    props: {
        disabled: true,
    },
})
UserHeaderEventMap.value.push({
    key: 'userinfo',
    title: '账户管理',
    handle: () => {
        router.push('/control/user');
    }
})
UserHeaderEventMap.value.push({
    key: 'outlogin',
    title: '退出登录',
    handle: () => {
        userStore.clearUserInfo().then(() => {
            if (router.currentRoute.value.meta.login !== false) {
                storage.set('login_redirect_url', router.currentRoute.value.fullPath);
                router.push('/login');
            }
        })
    }
})
const handleClickUserInfo = (e: UserHeaderEventMapInterface) => {
    typeof e.handle === 'function' && e.handle();
}
const active = ref<string | null>();
watchEffect(() => {
    active.value = router.currentRoute.value.name as string
})
const headerRef = ref();
const placeholderStyle = ref({
    height: ''
});
onMounted(() => {
    if (props.placeholder) {
        placeholderStyle.value.height = headerRef.value.clientHeight + 'px';
    }
    document.body.style.setProperty('--header-height', headerRef.value.clientHeight + 'px');
})
</script>

<template>
    <header ref="headerRef" class="bg-filter header-theme" :class="['theme--' + props.theme]">
        <div class="flex layouts">
            <a class="px-10 py-2 mr-10" href="/">
                <item-logo :theme="props.theme" width="100px" height="46px" />
            </a>
            <div class="flex nav-list flex-x-space-between">
                <el-link class="nav-item" :class="{ 'active': active?.startsWith('index') }" href="/"
                    :underline="false">首页</el-link>
                <el-link class="nav-item" :class="{ 'active': active?.startsWith('apps') }" href="/#/apps"
                    :underline="false">应用市场</el-link>
                <el-link class="nav-item" :href="item.url" :underline="false" :target="item.target"
                    v-for="item in WEBCONFIG.header_nav">{{ item.title }}</el-link>
                <el-link class="nav-item" :class="{ 'active': active?.startsWith('control') }" href="/#/control"
                    :underline="false">控制台</el-link>
            </div>
            <div class="flex-1"></div>
            <div class="px-4 flex flex-center">
                <el-switch v-model="theme" style="--el-switch-on-color:#2c2c2c;" active-action-icon="Moon"
                    inactive-action-icon="Sunny" active-value="dark" inactive-value="OS" />
            </div>
            <div v-if="userStore.hasLogin()" class="hover-rounded-4 flex flex-center">
                <el-dropdown :hide-on-click="false" @command="handleClickUserInfo" :teleported="false"
                    placement="bottom-end">
                    <div class="flex flex-center p-2 pointer"
                        @click="handleClickUserInfo(UserHeaderEventMap.find(item => item.key === 'userinfo' ?? item) as UserHeaderEventMapInterface)">
                        <!-- <div class="h9 font-weight-600 pr-3 text-right text-ellipsis-1 text-dark"
                            style="min-width:80px;max-width:200px">{{
                                USERINFO?.nickname }}</div> -->
                        <el-avatar :size="30" :src="USERINFO?.headimg"></el-avatar>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="item in UserHeaderEventMap" :key="item.key" :command="item"
                                v-bind="item.props" class="flex-x-center">{{ item.title }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="flex flex-center p-4 pointer text-primary" v-else>
                <el-button plain round text bg @click="router.push('/register')" class="btn-bg-transparent">
                    <div class="px-4">注册</div>
                </el-button>
                <el-button round text bg @click="router.push('/login')">
                    <div class="px-4">登录</div>
                </el-button>
            </div>
        </div>
    </header>
    <div :style="placeholderStyle"></div>
</template>

<style scoped lang="scss">
header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    transition: all .3s;
}


.nav-list {
    width: 100%;
    max-width: 550px;
}

.nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 12px;
    padding-right: 12px;
    --el-link-text-color: var(--el-text-color-primary);
    position: relative;
    font-weight: 600;
}


.active {
    color: var(--el-color-primary);
}

.header-theme {
    background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), .75);
}

.header-theme.theme--transparent {
    --el-color-primary: #FFFFFF;
    --el-text-color-primary: #656565;
    background-color: rgba(var(--el-bg-color-rgb-r), var(--el-bg-color-rgb-g), var(--el-bg-color-rgb-b), 0);
    backdrop-filter: blur(0px);
}

.header-theme.theme--dark {
    --el-color-primary: #FFFFFF;
    --el-text-color-primary: #656565;
    background-color: rgba(10, 10, 10, .75);
}

.header-theme.theme--transparent .el-button.is-text.btn-bg-transparent,
.header-theme.theme--dark .el-button.is-text.btn-bg-transparent {
    --el-fill-color-light: transparent;
    --el-button-hover-bg-color: transparent;
    --el-fill-color: transparent;
    border-width: 1px;
    border-color: rgba(255, 255, 255, .5);
    --el-button-text-color: #FFFFFF;
}
</style>
