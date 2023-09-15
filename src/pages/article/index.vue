<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
import router from '@/routers';
import { debounce } from '@/common/functions';
const props = withDefaults(defineProps<{
    classifyAlias?: string
}>(), {
});
const search = ref({
    total: 0,
    per_page: 10,
    classify_alias: props.classifyAlias,
    page: 1
})
const tableData = ref([])

const handleSizeChange = (val: any) => {
    search.value.per_page = val;
    getList();
}
const handleCurrentChange = (val: any) => {
    search.value.page = val;
    getList();
}
const QueryState = ref(false);
const getList = () => {
    if (QueryState.value) {
        return;
    }
    QueryState.value = true;
    $http.get('article/index/Query', {
        params: search.value
    }).then((ret: any) => {
        tableData.value = [];
        if (ret.code === $http.ResponseCode.SUCCESS) {
            search.value.total = ret.data.total;
            search.value.per_page = ret.data.per_page;
            tableData.value = ret.data.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    }).finally(() => {
        QueryState.value = false;
    })
}
const SetState = (row: any) => {
    const state = row.state;
    row.state_loading = true;
    $http.post('article/index/SetState', {
        id: row.id
    }).then((ret: any) => {
        row.state_loading = false;
        if (ret.code === $http.ResponseCode.SUCCESS) {
            ElMessage.success(ret.message);
        } else {
            throw new Error(ret.message);
        }
    }).catch((err: any) => {
        row.state_loading = false;
        ElMessage.error(err.message);
        nextTick(() => {
            row.state = state;
        })
    })
}
const deleteData = (scope: any) => {
    $http.post('article/index/Delete', { id: scope.row.id }).then((ret: any) => {
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
                handleCurrentChange(1);
            } else {
                ElMessage.info(ret.message);
            }
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
const setSortAjax = debounce((val: any, scope: any) => {
    $http.post('article/index/SetSort',
        { id: scope.row.id, sort: val })
        .then((ret: any) => {
            if (ret.code !== $http.ResponseCode.SUCCESS) {
                throw new Error(ret.message);
            }
        }).catch((err: any) => {
            ElMessage.error(err.message);
        })
}, 300);
const setSort = setSortAjax;
onMounted(() => {
    getList();
})
onActivated(() => {
    getList();
})
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="发布新文章" placement="bottom-end">
                <el-button type="primary" icon="Position" @click="router.push({
                    path: '/article/publish',
                    query: {
                        classify_alias: search.classify_alias
                    }
                })">发布</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <el-table :data="tableData" style="width: 100%;height: 100%;" border>
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column label="标题" min-width="200">
                <template #default="scope">
                    <div>
                        <div class="font-weight-600">{{ scope.row.title }}</div>
                        <div class="h10 text-grey">{{ scope.row.subtitle }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="别名" prop="alias" width="140" />
            <el-table-column label="分类" prop="classify_title" width="140" />
            <el-table-column label="来源" prop="source" width="140" />
            <el-table-column label="封面" width="200">
                <template #default="scope">
                    <el-image v-for="url in scope.row.thumb_url" style="width: 30px; height: 30px" class="mr-1" :src="url"
                        :zoom-rate="1.2" preview-teleported :preview-src-list="scope.row.thumb_url" fit="cover" />
                </template>
            </el-table-column>
            <el-table-column label="开放时间" width="160">
                <template #default="scope">
                    <el-tag size="small" type="info" v-if="scope.row.start_time">{{ scope.row.start_time }}</el-tag>
                    <el-tag size="small" type="info" v-if="scope.row.end_time">{{ scope.row.end_time }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" :loading="scope.row.state_loading"
                        @change="SetState(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="浏览量/排序" width="200">
                <template #default="scope">
                    <div class="h10">
                        <div>{{ scope.row.view }}</div>
                        <el-input-number v-model="scope.row.sort" :min="0" :max="99" :step="1" step-strictly size="small"
                            @change="setSort($event, scope)" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="创建/更新时间" width="200">
                <template #default="scope">
                    <div class="h10">
                        <div>{{ scope.row.create_time }}</div>
                        <div>{{ scope.row.update_time }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="#" width="160">
                <template #default="scope">
                    <el-tooltip effect="dark" content="编辑" placement="left">
                        <el-button type="primary" icon="Edit" size="small" @click="router.push({
                            path: '/article/publish',
                            query: {
                                classify_alias: search.classify_alias,
                                id: scope.row.id
                            }
                        })"></el-button>
                    </el-tooltip>
                    <el-popconfirm icon="Delete" icon-color="var(--el-color-danger)" title="确定继续删除该数据及子数据吗？" width="200px"
                        confirm-button-text="继续删除" confirm-button-type="danger" @confirm="deleteData(scope)"
                        v-if="!scope.row.is_system">
                        <template #reference>
                            <el-button type="danger" icon="Delete" size="small"></el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <div class="px-4 pt-4">
            <el-pagination :page-sizes="[10, 20, 50, 100]" :page-size="search.per_page" background
                layout="total, sizes, prev, pager, next, jumper" :total="search.total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
    </div>
</template>