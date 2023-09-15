<script lang="ts" setup>
import { $http } from '@/common/common';
import { ads_seat_alias } from '@/common/config';
import { ElMessage } from 'element-plus';
import router from "@/routers";
const createAdsSeatRef = ref();
const createAdsRef = ref();
const tableData = ref<any[]>([]);
const getList = () => {
    $http.get('ads/seat/Query').then((res: any) => {
        tableData.value = [];
        if (res.code === $http.ResponseCode.SUCCESS) {
            tableData.value = res.data;
        }
    })
}
const refreshCache = () => {
    $http.get('ads/seat/Cache').then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            ElMessage.success(ret.message);
        } else {
            ElMessage.info(ret.message);
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
const getAliasTitle = (alias: string) => {
    return ads_seat_alias.find((item: any) => item.alias === alias)?.title || '';
}
const setState = (item: any) => {
    const state = item.state ? 0 : 1;
    $http.post('ads/seat/SetState',
        { id: item.id })
        .then((ret: any) => {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
            } else {
                throw new Error(ret.message);
            }
        }).catch((err: any) => {
            ElMessage.error(err.message);
            nextTick(() => {
                item.state = state;
            })
        })
}
const deleteData = (scope: any) => {
    $http.post('ads/seat/Delete', { id: scope.id }).then((ret: any) => {
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
                getList();
            } else {
                ElMessage.info(ret.message);
            }
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
onMounted(() => {
    getList();
})
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="刷新缓存" placement="bottom-end">
                <el-button type="warning" icon="Refresh" @click="refreshCache"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建广告位" placement="bottom-end">
                <el-button type="primary" icon="Plus" @click="createAdsSeatRef.open()">创建广告位</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <div class="flex-1 flex flex-warp seat-list p-10">
            <div class="m-6 shadow bg-hover hover-bg-white rounded-4 seat-list-item p-4 flex flex-column"
                v-for="item in tableData">
                <div class="h10 flex flex-y-center">
                    <div class="text-danger mr-4">{{ item.title }}</div>
                    <div class="flex-1">{{ getAliasTitle(item.alias) }}</div>
                    <el-switch v-model="item.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setState(item)" />
                </div>
                <div class="h1 font-weight-600 flex-1 flex flex-center">
                    <div class="flex flex-y-flex-end pointer" @click="router.push('/ads/list?seat=' + item.id)">
                        <span>{{ item.ads_num }}</span>
                        <span class="h10 pb-2 text-grey pl-2">个广告</span>
                    </div>
                </div>
                <div class="h10 flex flex-y-center">
                    <div class="font-weight-600 flex-1">{{ item.seat }}</div>
                    <el-tooltip effect="dark" content="添加广告" placement="bottom" :enterable="false">
                        <el-button type="success" bg text icon="Plus" size="small"
                            @click="createAdsRef.open({ pid: item.id })"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="编辑" placement="bottom" :enterable="false">
                        <el-button type="primary" bg text icon="Edit" size="small"
                            @click="createAdsSeatRef.open(item)"></el-button>
                    </el-tooltip>
                    <el-popconfirm icon="Delete" icon-color="var(--el-color-danger)" title="确定继续删除该数据及子数据吗？" width="200px"
                        confirm-button-text="继续删除" confirm-button-type="danger" @confirm="deleteData(item)">
                        <template #reference>
                            <el-button type="danger" bg text icon="Delete" size="small"></el-button>
                        </template>
                    </el-popconfirm>
                </div>
            </div>
        </div>
        <create-ads-seat ref="createAdsSeatRef" @success="getList" />
        <create-ads ref="createAdsRef" @success="getList" />
    </div>
</template>
<style scoped lang="scss">
.seat-list {
    overflow-y: auto;
    transition: all .3s;

    &-item {
        width: 300px;
        height: 200px;
    }
}
</style>