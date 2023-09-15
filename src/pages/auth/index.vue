<script lang="ts" setup>
import { ElLoading, ElMessage } from 'element-plus'
import { $http } from "@/common/common";
import { useMenuStore } from "@/stores";
import { son_auth } from '@/common/config';
import { debounce } from '@/common/functions';
const { setMenu } = useMenuStore();
const tableData = ref([])

const getAuthListById = (row: any, _treeNode: any, resolve: Function) => {
    $http.get('auth/index/Query', {
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
const getAuth = () => {
    $http.get('auth/index/Query').then((ret: any) => {
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
    $http.get('auth/index/Cache').then((ret: any) => {
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
const deleteData = (scope: any) => {
    $http.post('auth/index/Delete', { id: scope.row.id }).then((ret: any) => {
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(ret.message);
                tableData.value = [];
                getAuth();
            } else {
                ElMessage.info(ret.message);
            }
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    })
}
const createAuthRef = ref();
const addAuth = () => {
    createAuthRef.value.open();
}
const editAuth = (scope: any) => {
    createAuthRef.value.open(scope.row);
}
const setAuthShow = (scope: any) => {
    const is_show = scope.row.is_show ? 0 : 1;
    $http.post('auth/index/SetShow',
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
                scope.row.is_show = is_show;
            })
        })
}
const setAuthState = (scope: any) => {
    const state = scope.row.state ? 0 : 1;
    $http.post('auth/index/SetState',
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
const setAuthSortAjax = debounce((val: any, scope: any) => {
    $http.post('auth/index/SetSort',
        { id: scope.row.id, sort: val })
        .then((ret: any) => {
            if (ret.code !== $http.ResponseCode.SUCCESS) {
                throw new Error(ret.message);
            }
        }).catch((err: any) => {
            ElMessage.error(err.message);
        })
}, 300);
const setAuthSort = setAuthSortAjax;
onMounted(() => {
    getAuth();
})
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="刷新缓存" placement="bottom-end">
                <el-button type="warning" icon="Refresh" @click="authCache"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="创建权限" placement="bottom-end">
                <el-button type="primary" icon="Plus" @click="addAuth">创建</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <el-table :data="tableData" style="width: 100%;height: 100%;" row-key="id" border lazy :load="getAuthListById"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
            <el-table-column prop="title" label="名称" width="200" />
            <el-table-column label="图标" width="60">
                <template #default="scope">
                    <el-icon v-if="scope.row.icon" class="flex flex-center" :size="20" color="#000010">
                        <component :is="scope.row.icon"></component>
                    </el-icon>
                </template>
            </el-table-column>
            <el-table-column label="规则" min-width="500">
                <template #default="scope">
                    <div>
                        <div>{{ scope.row.url }}</div>
                        <div v-if="scope.row.son_auth">
                            <div class="flex" v-for="item in scope.row.son_auth">
                                <template v-for="s in son_auth">
                                    <div class="w-15 min-w-15" v-if="item == s.action">{{ s.name }}：</div>
                                </template>
                                <div>{{ scope.row.url }}/{{ item }}</div>
                            </div>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="控制器/操作" width="200">
                <template #default="scope">
                    <div v-if="scope.row.controller && scope.row.action">
                        {{ scope.row.controller }}/{{ scope.row.action }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="显示" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.is_show" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setAuthShow(scope)" />
                </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" @change="setAuthState(scope)" />
                </template>
            </el-table-column>
            <el-table-column label="权重" width="146">
                <template #default="scope">
                    <el-input-number v-model="scope.row.sort" :min="0" :max="99" :step="1" step-strictly size="small"
                        @change="setAuthSort($event, scope)" />
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="#" width="160">
                <template #default="scope">
                    <el-tooltip effect="dark" content="编辑" placement="left">
                        <el-button type="primary" icon="Edit" size="small" @click="editAuth(scope)"></el-button>
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
        <create-auth ref="createAuthRef" @success="getAuth" />
    </div>
</template> 
<style></style>