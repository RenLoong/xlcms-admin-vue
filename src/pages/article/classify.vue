<script lang="ts" setup>
import { ElLoading, ElMessage } from 'element-plus'
import { $http } from "@/common/common";
import { debounce } from '@/common/functions';
const tableData = ref([])

const getListListById = (row: any, _treeNode: any, resolve: Function) => {
    $http.get('article/classify/Query', {
        params: {
            id: row.id
        }
    }).then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            resolve(ret.data);
        } else {
        }
    }).catch(err => {
        ElMessage.error(err.message);
    })
}
const getList = () => {
    $http.get('article/classify/Query').then((ret: any) => {
        tableData.value = [];
        if (ret.code === $http.ResponseCode.SUCCESS) {
            tableData.value = ret.data;
        } else {
        }
    }).catch(err => {
        ElMessage.error(err.message);
    })
}
const authCache = () => {
    const loading = ElLoading.service();
    $http.get('article/classify/Cache').then((ret: any) => {
        loading.close();
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
            } else {
                ElMessage.info(ret.message);
            }
        }
    }).catch((err: any) => {
        loading.close();
        ElMessage.error(err.message);
    })
}
const deleteData = (scope: any) => {
    $http.post('article/classify/Delete', { id: scope.row.id }).then((ret: any) => {
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
                tableData.value = [];
                getList();
            } else {
                ElMessage.info(ret.message);
            }
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
const createArticleClassifyRef = ref();
const setState = (scope: any) => {
    const state = scope.row.state ? 0 : 1;
    $http.post('article/classify/SetState',
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
const setSortAjax = debounce((val: any, scope: any) => {
    $http.post('article/classify/SetSort',
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
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="刷新缓存" placement="bottom-end">
                <el-button type="warning" icon="Refresh" @click="authCache"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建分类" placement="bottom-end">
                <el-button type="primary" icon="Plus" @click="createArticleClassifyRef.open()">创建</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <el-table :data="tableData" style="width: 100%;height: 100%;" row-key="id" border lazy :load="getListListById"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
            <el-table-column prop="title" label="名称" min-width="200" />
            <el-table-column prop="alias" label="名称" width="200" />
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setState(scope)" />
                </template>
            </el-table-column>
            <el-table-column label="排序" width="146">
                <template #default="scope">
                    <el-input-number v-model="scope.row.sort" :min="0" :max="99" :step="1" step-strictly size="small"
                        @change="setSort($event, scope)" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="#" width="160">
                <template #default="scope">
                    <el-tooltip effect="dark" content="编辑" placement="left">
                        <el-button type="primary" icon="Edit" size="small"
                            @click="createArticleClassifyRef.open(scope.row)"></el-button>
                    </el-tooltip>
                    <el-popconfirm icon="Delete" icon-color="var(--el-color-danger)" title="确定继续删除该数据吗？" width="200px"
                        confirm-button-text="继续删除" confirm-button-type="danger" @confirm="deleteData(scope)"
                        v-if="!scope.row.hasChildren && scope.row.articleCount <= 0">
                        <template #reference>
                            <el-button type="danger" icon="Delete" size="small"></el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <create-article-classify ref="createArticleClassifyRef" @success="getList" />
    </div>
</template> 
<style></style>