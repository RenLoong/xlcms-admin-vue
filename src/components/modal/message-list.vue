<script lang="ts" setup>
import { $http, $eventBus } from '@/common/common';
import router from '@/routers';
import { ElMessage } from 'element-plus'

const drawer = ref(false);
const handleClose = (done: () => void) => {
    done();
}
const search = ref<{
    page: number,
    limit: number,
    total: number,
    state: number | string,
    [propName: string]: any
}>({
    page: 1,
    limit: 20,
    total: 0,
    state: 'all',
});
const setSearchItem = (key: string, val: number | string) => {
    search.value[key] = val;
    search.value.page = 1;
    getList();
}
const handleSizeChange = (val: number) => {
    search.value.page = 1;
    search.value.limit = val;
    getList();
}
const handleCurrentChange = (val: number) => {
    search.value.page = val;
    getList();
}
const listData = ref<any[]>([]);
const loadingState = ref(false);
const getList = () => {
    if (loadingState.value) return;
    loadingState.value = true;
    $http.get('Message/index', {
        params: search.value
    })
        .then((ret: any) => {
            loadingState.value = false;
            listData.value = [];
            if (ret.code === $http.ResponseCode.SUCCESS) {
                search.value.total = ret.data.total;
                search.value.limit = ret.data.per_page;
                listData.value = ret.data.data;
            }
        }).catch(() => {
            loadingState.value = false;
        })
}
const open = () => {
    drawer.value = true;
    search.value.page = 1;
    search.value.state = 0;
    getList();
}
const close = () => {
    drawer.value = false;
}
const setMessageRead = (item?: any) => {
    if (item && item.is_read) return;
    $http.post('Message/read', {
        id: item?.id
    })
        .then((ret: any) => {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                if (item) {
                    item.is_read = 1;
                    item.effect = 'info';
                } else {
                    getList();
                }
                // 发送事件
                $eventBus.emit('message');
            } else {
                ElMessage.info(ret.msg);
            }
        })
}
const rejectTeamInvite = (item: any) => {
    $http.post('DevTeam/rejectTeamInvite', {
        id: item.alias_id
    })
        .then((ret: any) => {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                item.is_read = 1;
                item.invite_state = 2;
                $eventBus.emit('message');
            } else {
                ElMessage.info(ret.msg);
            }
        })
}
const acceptTeamInvite = (item: any) => {
    $http.post('DevTeam/acceptTeamInvite', {
        id: item.alias_id
    })
        .then((ret: any) => {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                item.is_read = 1;
                item.invite_state = 1;
                $eventBus.emit('message');
            } else {
                ElMessage.info(ret.msg);
            }
        })
}
const handelIssues = (item: any) => {
    if (!item.is_read) {
        setMessageRead(item);
    }
    if (item.extra) {
        if (item.extra.identity === 'dev') {
            router.push('/control/developer/issues')
        } else {
            router.push('/issues/detail?id=' + item.alias_id)
        }
        close();
    }
}
defineExpose({
    open,
    close
})
</script>
<template>
    <el-drawer v-model="drawer" :before-close="handleClose" size="500px" :show-close="false">
        <template #header>
            <div class="flex font-weight-600">
                <div class="header-item" :class="{ 'header-item--active': search.state === 'all' }"
                    @click="setSearchItem('state', 'all')">全部</div>
                <div class="header-item" :class="{ 'header-item--active': search.state === 0 }"
                    @click="setSearchItem('state', 0)">未读</div>
                <div class="header-item" :class="{ 'header-item--active': search.state === 1 }"
                    @click="setSearchItem('state', 1)">历史</div>
            </div>
            <el-button type="info" @click="setMessageRead()" link>
                <el-icon class="el-icon--left">
                    <Delete />
                </el-icon>
                全部已读
            </el-button>
        </template>
        <div v-if="listData.length > 0">
            <div v-for="item in listData">
                <div class="mb-4 bg rounded-4 p-4" v-if="item.type === 'inviteJoinTeam'">
                    <div class="flex flex-center mb-4">
                        <el-avatar :src="item.extra.headimg" :size="60" />
                        <div class="flex-1 pl-2 h10">
                            <div class="font-weight-600 h9 mb-2">{{ item.extra.title }}团队</div>
                            <div class="text-grey">{{ item.extra.email }}</div>
                        </div>
                        <el-link :href="item.extra.home_url" target="_blank" :underline="false">Ta的主页</el-link>
                    </div>
                    <el-alert title="邀请函"
                        :type="item.invite_state === 0 ? 'info' : item.invite_state === 1 ? 'success' : 'error'"
                        :description="item.title" show-icon :closable="false" />
                    <div class="flex flex-center mt-4" v-if="item.invite_state === 0">
                        <el-popconfirm :title="'确认拒绝' + item.extra.title + '团队的邀请吗？'" width="200px"
                            @confirm="rejectTeamInvite(item)">
                            <template #reference>
                                <el-button type="danger">拒绝</el-button>
                            </template>
                        </el-popconfirm>
                        <el-button type="success" @click="acceptTeamInvite(item)">接受</el-button>
                    </div>
                </div>
                <div class="mb-4 pointer" v-if="item.type === 'issues'" @click="handelIssues(item)">
                    <el-alert :title="item.type_text" :type="item.effect" :description="item.title" :closable="false"
                        show-icon />
                </div>
                <div class="mb-4" :class="{ 'pointer': item.is_read === 0 }" v-else @click="setMessageRead(item)">
                    <el-alert :title="item.type_text" :type="item.effect" :description="item.title" :closable="false"
                        show-icon />
                </div>
            </div>
        </div>
        <div class="flex flex-center h-100" v-else>
            <el-empty description="暂无消息~" />
        </div>
        <template #footer>
            <div class="text-initial">
                <el-pagination v-model:current-page="search.page" v-model:page-size="search.limit"
                    :page-sizes="[10, 20, 50, 100]" background layout="sizes, prev, pager, next" :total="search.total"
                    :pager-count="5" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </template>
    </el-drawer>
</template>
<style lang="scss" scoped>
.header-item {
    position: relative;
    margin-right: 20px;
    cursor: pointer;

    &--active {
        color: var(--el-color-primary);
    }

    &::after {
        position: absolute;
        left: 100%;
        right: 100%;
        bottom: -10px;
        content: '';
        height: 4px;
        background-color: var(--el-color-primary);
        border-radius: 2px;
        transition: all 0.3s;
    }

    &--active::after {
        left: 30%;
        right: 30%;
    }
}
</style>