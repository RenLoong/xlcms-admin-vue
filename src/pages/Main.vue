<script setup lang="ts">
import router from "@/routers";
import { $http, useStorage, $eventBus } from '@/common/common';
import { useUserStore, useRefs } from "@/stores";
import { RouteLocationNormalizedLoaded } from "vue-router";
import useTheme from "@/common/theme";
import config from "@/common/config"
const storage = useStorage()
const userStore = useUserStore()
const { USERINFO } = useRefs(userStore)
const UserHeaderEventMap = ref<UserHeaderEventMapInterface[]>([]);
const DevTeam = ref<any[]>([]);
const editAdminSelfRef = ref();
UserHeaderEventMap.value.push({
    key: 'username',
    title: '账户:' + USERINFO.value.username,
    props: {
        class: 'flex-x-center',
        disabled: true,
        divided: DevTeam.value.length ? true : false
    },
})
UserHeaderEventMap.value.push({
    key: 'userinfo',
    title: '账户管理',
    props: {
        class: 'flex-x-center'
    },
    handle: () => {
        editAdminSelfRef.value.open(USERINFO.value);
    }
})
UserHeaderEventMap.value.push({
    key: 'outlogin',
    title: '退出登录',
    props: {
        class: 'flex-x-center'
    },
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
const isCollapse = ref(false)
const menuActive = ref<string>('/control');

const coltrolHeaderTabsRef = ref();
const openPageList = reactive<RouteLocationNormalizedLoaded[]>([]);
watchEffect(() => {
    const val = router.currentRoute.value;
    menuActive.value = val.path;
    nextTick(() => {
        if (val.meta.showHeader) {
            if (openPageList.find(item => item.path == val.path) === undefined) {
                openPageList.push(val);
                nextTick(() => {
                    coltrolHeaderTabsRef.value.scrollTo({ left: coltrolHeaderTabsRef.value.scrollWidth + 200, behavior: 'smooth' })
                })
            }
        }
    })
})
const componentToClear = ref();
const closeHeaderPage = (index: number) => {
    // 判断是否存在自定义组件名称
    if (openPageList[index].meta.componentName) {
        componentToClear.value = openPageList[index].meta.componentName;
    } else {
        componentToClear.value = openPageList[index].path;
    }
    if (router.currentRoute.value.name !== openPageList[index].name) {
        return openPageList.splice(index, 1);
    }
    if (openPageList[index + 1]) {
        router.push(openPageList[index + 1].fullPath);
        openPageList.splice(index, 1);
    } else if (openPageList[index - 1]) {
        router.push(openPageList[index - 1].fullPath);
        openPageList.splice(index, 1);
    }

}
const switchTabs = (e: any, item: RouteLocationNormalizedLoaded) => {
    router.push(item.fullPath);
    const left = e.target.offsetLeft + e.target.offsetWidth / 2 - coltrolHeaderTabsRef.value.offsetWidth / 2 - 12;
    coltrolHeaderTabsRef.value.scrollTo({ left: left, behavior: 'smooth' })
}
onBeforeMount(() => {
    menuActive.value = router.currentRoute.value.path;
})
const UnreadCountLoading = ref(false);
const UnreadCount = ref({
    count: 0,
    dev_issues: 0,
    issues: 0,
});
const getUnreadCount = () => {
    if (UnreadCountLoading.value) return;
    UnreadCountLoading.value = true;
    $http.get('Message/getUnreadCount').then((res: any) => {
        if (res && res.code === $http.ResponseCode.SUCCESS) {
            UnreadCount.value = res.data;
        }
    }).finally(() => {
        UnreadCountLoading.value = false;
    })
}
let UnreadCountEr: NodeJS.Timeout;
const notificationIconRef = ref();
const messageListRef = ref();
const { theme } = useTheme();
onMounted(() => {
    // UnreadCountEr = setInterval(getUnreadCount, 10000);
    getUnreadCount();
    // 监听事件通知
    $eventBus.on('message', getUnreadCount)
})
onUnmounted(() => {
    clearInterval(UnreadCountEr);
    $eventBus.remove('message', getUnreadCount);
})
</script>

<template>
    <main class="page vw-100 vh-100">
        <div class="control-left flex flex-column">
            <div class="p-6 flex flex-center">
                <el-button type="primary" :icon="isCollapse ? 'Expand' : 'Fold'" @click="isCollapse = !isCollapse"
                    link></el-button>
            </div>
            <div class="flex-1 overflow-y-auto control-left-menu-body" :style="{ width: isCollapse ? 'auto' : '200px' }">
                <item-control-menu v-bind="UnreadCount" :default-active="menuActive" class="control-left-menu"
                    :collapse="isCollapse" />
            </div>
            <div class="py-6 text-center h10 text-grey" v-if="!isCollapse">v{{ config.version_name }}</div>
        </div>
        <div class="flex-1 flex flex-column p-4">
            <header class="coltrol-header mb-4">
                <div class="flex-1 flex flex-y-center flex-nowrap overflow-x-auto coltrol-header-tabs"
                    ref="coltrolHeaderTabsRef">
                    <div v-for="(item, index) in openPageList" class="text-grey" :key="index">
                        <div class="rounded-4 px-4 py-2 pointer flex flex-center mr-1 coltrol-header-tabs-item"
                            :class="{ 'bg-white text-dark': router.currentRoute.value.path == item.path }"
                            @click="switchTabs($event, item)">
                            <span class="h9 font-weight-600 text-keep-all">{{ item.meta.title }}</span>
                            <el-icon class="ml-2 coltrol-header-tabs-close-icon" @click.stop="closeHeaderPage(index)"
                                color="#999999" v-if="item.path !== '/index' && openPageList.length > 1">
                                <Close class="text-dark" />
                            </el-icon>
                        </div>
                    </div>
                </div>
                <div class="flex coltrol-header-tool px-4 ml-10">
                    <el-tooltip content="打开首页" placement="bottom-end">
                        <div class="px-4 pointer hover-bg-hover rounded-4 flex flex-center" @click="router.push('/')">
                            <el-icon>
                                <Monitor class="text-dark" />
                            </el-icon>
                        </div>
                    </el-tooltip>
                    <el-tooltip :disabled="UnreadCount.count > 0" content="查看通知" placement="bottom-end">
                        <div class="px-4 pointer hover-bg-hover rounded-4 flex flex-center" ref="notificationIconRef"
                            @click="messageListRef.open()">
                            <el-icon>
                                <Notification class="text-dark" />
                            </el-icon>
                        </div>
                    </el-tooltip>
                    <div class="px-4 flex flex-center">
                        <el-switch v-model="theme" style="--el-switch-on-color:#2c2c2c;" active-action-icon="Moon"
                            inactive-action-icon="Sunny" active-value="dark" inactive-value="OS" />
                    </div>
                    <el-tooltip :visible="UnreadCount.count > 0" content="有新消息" placement="bottom" effect="red"
                        virtual-triggering :virtual-ref="notificationIconRef" />
                    <div class="hover-bg-hover rounded-4">
                        <el-dropdown :hide-on-click="false" @command="handleClickUserInfo" :teleported="false"
                            placement="bottom-end">
                            <div class="flex flex-center p-2 pointer"
                                @click="handleClickUserInfo(UserHeaderEventMap.find(item => item.key === 'userinfo' ?? item) as UserHeaderEventMapInterface)">
                                <div class="h9 font-weight-600 pr-3 text-right text-ellipsis-1" style="max-width:200px">{{
                                    USERINFO?.nickname }}</div>
                                <el-avatar :size="30" :src="USERINFO?.avatar_url"></el-avatar>
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="item in UserHeaderEventMap" :key="item.key" :command="item"
                                        v-bind="item.props">{{ item.title }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </header>
            <router-view v-slot="{ Component }">
                <keep-alive :exclude="componentToClear">
                    <component :is="Component" />
                </keep-alive>
            </router-view>
            <message-list ref="messageListRef" />
            <edit-admin-self ref="editAdminSelfRef" />
        </div>
    </main>
</template>

<style lang="scss" scoped>
.page {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    background-color: var(--el-bg-color-page);

    .control-left {
        background-color: var(--el-bg-color);
        box-shadow: 20px 20px 60px var(--el-bg-color),
            -20px -20px 60px var(--el-bg-color-page);
        overflow: auto;

        .control-left-menu-body {
            width: auto;
            transition: width .5s;
        }

        .control-left-menu {
            border-right: none;
        }
    }

    .coltrol-header {
        display: flex;

        &-tool {
            border-radius: 10px;
            background-color: var(--el-bg-color);
            box-shadow: 20px 20px 60px var(--el-bg-color),
                -20px -20px 60px var(--el-bg-color-page);
        }

        &-tabs {
            position: relative;
        }

        &-tabs-close-icon {
            width: 0;
            transition: all 0.3s;
        }

        &-tabs-item {
            &:hover {
                background-color: var(--el-bg-color);

                .coltrol-header-tabs-close-icon {
                    width: 1em;
                }
            }
        }
    }
}
</style>
