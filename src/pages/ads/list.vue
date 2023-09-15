<script lang="ts" setup>
import { $http } from '@/common/common';
import { ads_seat_alias } from '@/common/config';
import { setClipboard } from '@/common/functions';
import router from '@/routers';
import { ElMessage } from 'element-plus';
const createAdsSeatRef = ref();
const createAdsRef = ref();
const tableData = ref<any[]>([]);
const getList = () => {
    $http.get('ads/list/Query', {
        params: search.value
    }).then((res: any) => {
        tableData.value = [];
        if (res.code === $http.ResponseCode.SUCCESS) {
            search.value.total = res.data.total;
            search.value.per_page = res.data.per_page;
            tableData.value = res.data.data;
        }
    })
}
const refreshCache = () => {
    $http.get('ads/list/Cache').then((ret: any) => {
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
    $http.post('ads/list/SetState',
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
const deleteData = (item: any) => {
    $http.post('ads/list/Delete', { id: item.id }).then((ret: any) => {
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
const search = ref({
    page: 1,
    per_page: 10,
    total: 0,
    keyword: '',
    state: '',
    seat: '',
    start_time: '',
    end_time: '',
});
const handleSizeChange = (val: number) => {
    search.value.per_page = val;
    getList();
}
const handleCurrentChange = (val: number) => {
    search.value.page = val;
    getList();
}
onMounted(() => {
    getList();
})
onActivated(() => {
    const query = router.currentRoute.value.query;
    if (query.seat) {
        search.value.seat = query.seat as string;
    }
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
            <el-tooltip effect="dark" content="创建广告位" placement="bottom-end">
                <el-button type="success" icon="Plus" @click="createAdsRef.open()">创建广告</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <div class="flex-1 flex flex-wrap seat-list p-10 flex-flex-start">
            <div class="m-6 shadow bg-hover hover-bg-white rounded-4 seat-list-item p-4 flex flex-column"
                v-for="item in tableData">
                <div class="h10 flex flex-y-center">
                    <div class="text-danger mr-4">{{ item.title }}</div>
                    <el-tooltip effect="dark" content="排版" placement="top" :enterable="false">
                        <div class="font-weight-600">{{ getAliasTitle(item.seat_alias) }}</div>
                    </el-tooltip>
                    <div class="flex-1"></div>
                    <el-switch v-model="item.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setState(item)" />
                </div>
                <div class="py-4 flex-1 flex flex-center">
                    <el-image :src="item.path_url" class="rounded-4" style="height: 200px;width: 100%;" fit="contain" />
                </div>
                <div class="h10 flex flex-y-center">
                    <div class="font-weight-600">{{ item.seat }}</div>
                    <el-tooltip effect="dark" content="开始时间" placement="bottom" :enterable="false" v-if="item.start_time">
                        <div class="font-weight-600 text-success px-2">{{ item.start_time }}</div>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="结束时间" placement="bottom" :enterable="false" v-if="item.end_time">
                        <div class="font-weight-600 text-danger px-2">{{ item.end_time }}</div>
                    </el-tooltip>
                    <div class="flex-1"></div>
                    <el-tooltip effect="dark" content="复制链接" placement="bottom" :enterable="false">
                        <el-button bg text icon="Link" size="small"
                            @click="setClipboard(item.action === '#DEFAULE#' ? item.url : item.action)"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="编辑" placement="bottom" :enterable="false">
                        <el-button type="primary" bg text icon="Edit" size="small"
                            @click="createAdsRef.open(item)"></el-button>
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
        <div class="px-4 pt-4">
            <el-pagination :page-sizes="[10, 20, 50, 100]" :page-size="search.per_page" background
                layout="total, sizes, prev, pager, next, jumper" :total="search.total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
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
        width: calc(50% - 36px);
    }
}
</style>