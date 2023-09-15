<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElLoading, ElMessage } from 'element-plus'
const tableData = ref([]);
const createRegionsRef = ref();

const getRegionsListById = (row: any, _treeNode: any, resolve: Function) => {
    $http.get('regions/list/Query', {
        params: {
            id: row.id
        }
    }).then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            resolve(ret.data);
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
const getRegions = () => {
    $http.get('regions/list/Query').then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            tableData.value = ret.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}

const regionsCache = () => {
    const loading = ElLoading.service();
    $http.get('regions/list/Cache').then((ret: any) => {
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
const setState = (scope: any) => {
    const state = scope.row.state ? 0 : 1;
    $http.post('regions/list/SetState',
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
    $http.post('regions/list/Delete', { id: scope.row.id }).then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            ElMessage.success(ret.message);
            tableData.value = [];
            getRegions();
        } else {
            ElMessage.info(ret.message);
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
onMounted(() => {
    getRegions();
})
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="刷新缓存" placement="bottom-end">
                <el-button type="warning" icon="Refresh" @click="regionsCache"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建地区" placement="bottom-end">
                <el-button type="primary" icon="Plus" @click="createRegionsRef.open()">创建</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <el-table :data="tableData" style="width: 100%;height:100%;" row-key="id" border lazy :load="getRegionsListById"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
            <el-table-column prop="id" label="地区代码" width="200" />
            <el-table-column prop="title" label="名称" min-width="200" />
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setState(scope)" />
                </template>
            </el-table-column>
            <el-table-column prop="level" label="行政等级" width="120">
                <template #default="scope">
                    <el-tag type="danger" v-if="scope.row.level === 0">省</el-tag>
                    <el-tag v-else-if="scope.row.level === 1">市</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.level === 2">区</el-tag>
                    <el-tag type="success" v-else>街道</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="pinyin_prefix" label="首字母" width="100">
                <template #default="scope">
                    <span class="text-uppercase">{{ scope.row.pinyin_prefix }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="#" width="160">
                <template #default="scope">
                    <el-tooltip effect="dark" content="编辑" placement="left">
                        <el-button type="primary" icon="Edit" size="small"
                            @click="createRegionsRef.open(scope.row)"></el-button>
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
        <create-regions ref="createRegionsRef" @success="getRegions" />
    </div>
</template>

    
<style></style>