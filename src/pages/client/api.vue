<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElLoading, ElMessage } from 'element-plus'
const search = ref({
    total: 0,
    per_page: 20,
    page: 1
})
const tableData = ref([]);

const handleSizeChange = (val: any) => {
    search.value.per_page = val;
    search.value.page = 1;
    getApi();
}
const handleCurrentChange = (val: any) => {
    search.value.page = val;
    getApi();
}
const getApi = () => {
    $http.get('client/api', {
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
    })
}
const apiCache = () => {
    const loading = ElLoading.service();
    $http.get('client/api/Cache').then((ret: any) => {
        loading.close();
        if (ret.code === $http.ResponseCode.SUCCESS) {
            ElMessage.success(ret.message);
        } else {
            ElMessage.info(ret.message);
        }
    }).catch((err: any) => {
        loading.close();
        ElMessage.error(err.message);
    })
}
const setApiLogin = (scope: any) => {
    const is_login = scope.row.is_login ? 0 : 1;
    $http.post('client/api/SetLogin',
        { id: scope.row.id })
        .then((ret: any) => {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
            } else {
                throw new Error(ret.message);
            }
        }).catch((err: any) => {
            ElMessage.error(err.message);
            nextTick(() => {
                scope.row.is_login = is_login;
            })
        })
}
const setApiState = (scope: any) => {
    const state = scope.row.state ? 0 : 1;
    $http.post('client/api/SetState',
        { id: scope.row.id })
        .then((ret: any) => {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
            } else {
                throw new Error(ret.message);
            }
        }).catch((err: any) => {
            ElMessage.error(err.message);
            nextTick(() => {
                scope.row.state = state;
            })
        })
}
const deleteData = (scope: any) => {
    $http.post('client/api/Delete', { id: scope.row.id }).then((ret: any) => {
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
                tableData.value = [];
                getApi();
            } else {
                ElMessage.info(ret.message);
            }
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
const createClientApiRef = ref();
onMounted(() => {
    getApi();
})
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="刷新缓存" placement="bottom-end">
                <el-button type="warning" icon="Refresh" @click="apiCache"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建接口" placement="bottom-end">
                <el-button type="primary" icon="Plus" @click="createClientApiRef.open()">创建</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <el-table :data="tableData" style="width: 100%;height: 100%;" border>
            <el-table-column prop="name" label="名称" width="200" />
            <el-table-column prop="url" label="URL" min-width="200" />
            <el-table-column label="应用/控制器/操作" width="300">
                <template #default="scope">
                    <div>
                        {{ scope.row.app }}/{{ scope.row.controller }}/{{ scope.row.action }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="登录" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.is_login" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setApiLogin(scope)" />
                </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setApiState(scope)" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="#" width="160">
                <template #default="scope">
                    <el-tooltip effect="dark" content="编辑" placement="left">
                        <el-button type="primary" icon="Edit" size="small"
                            @click="createClientApiRef.open(scope.row)"></el-button>
                    </el-tooltip>
                    <el-popconfirm icon="Delete" icon-color="var(--el-color-danger)" title="确定继续删除该数据及子数据吗？" width="200px"
                        confirm-button-text="继续删除" confirm-button-type="danger" @confirm="deleteData(scope)">
                        <template #reference>
                            <el-button type="danger" icon="Delete" size="small"></el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <div class="px-4 pt-4 xlcms-pagination">
            <el-pagination :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
                :total="search.total" :page-size="search.per_page" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
        <create-client-api ref="createClientApiRef" @success="getApi" />
    </div>
</template>
    
<style>
.hljs {
    line-height: 25px;
}

.hover-bg:hover {
    background-color: #F8F8F8;
}
</style>