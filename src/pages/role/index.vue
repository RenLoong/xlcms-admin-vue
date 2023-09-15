<script lang="ts" setup>
import { $http } from '@/common/common';
import { useMenuStore } from '@/stores';
import { ElLoading, ElMessage } from 'element-plus'
const { setMenu } = useMenuStore();
const tableData = ref([]);
const getRoleListById = (row: any, _treeNode: any, resolve: Function) => {
    $http.get('role/index/Query', {
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
const getRole = () => {
    $http.get('role/index/Query').then((ret: any) => {
        tableData.value = [];
        if (ret.code === $http.ResponseCode.SUCCESS) {
            tableData.value = ret.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
const roleCache = () => {
    const loading = ElLoading.service();
    $http.get('role/index/Cache').then((ret: any) => {
        loading.close();
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                setMenu(ret.data);
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
const createRoleRef = ref();
const setRoleState = (scope: any) => {
    const state = scope.row.state ? 0 : 1;
    $http.post('role/index/SetState',
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
    $http.post('role/index/Delete', { id: scope.row.id }).then((ret: any) => {
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
                tableData.value = [];
                getRole();
            } else {
                ElMessage.info(ret.message);
            }
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
onMounted(() => {
    getRole();
})
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="刷新缓存" placement="bottom-end">
                <el-button type="warning" icon="Refresh" @click="roleCache"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建角色" placement="bottom-end">
                <el-button type="primary" icon="Plus" @click="createRoleRef.open()">创建</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <el-table :data="tableData" style="width: 100%;height:100%;" row-key="id" border lazy :load="getRoleListById"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
            <el-table-column prop="name" label="名称" width="200" />
            <el-table-column label="权限">
                <template #default="scope">
                    <div v-if="scope.row.rule.length >= scope.row.auth_sum"> 拥有全部权限 </div>
                    <div v-else> 拥有{{ scope.row.rule.length }}项权限 </div>
                </template>
            </el-table-column>
            <el-table-column label="成员">
                <template #default="scope">
                    <div>
                        共有{{ scope.row.admin_num }}位成员
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setRoleState(scope)" />
                </template>
            </el-table-column>
            <el-table-column prop="update_time" label="最后一次修改时间" width="200" />
            <el-table-column prop="create_time" label="创建时间" width="200" />
            <el-table-column fixed="right" label="#" width="160">
                <template #default="scope">
                    <el-tooltip effect="dark" content="编辑" placement="left">
                        <el-button type="primary" icon="Edit" size="small"
                            @click="createRoleRef.open(scope.row)"></el-button>
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
        <create-role ref="createRoleRef" @success="getRole" />
    </div>
</template>
    