<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
import { weekText } from "@/common/config";
const search = ref({
    total: 0,
    per_page: 10,
    page: 1
})
const tableData = ref([])

const handleSizeChange = (val: any) => {
    search.value.per_page = val;
    getAdmin();
}
const handleCurrentChange = (val: any) => {
    tableData.value = [];
    search.value.page = val;
    getAdmin();
}
const getAdmin = () => {
    $http.get('admin/index/Query', {
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
const SetState = (row: any) => {
    const state = row.state;
    row.state_loading = true;
    $http.post('admin/index/SetState', {
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
    $http.post('admin/index/Delete', { id: scope.row.id }).then((ret: any) => {
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
const createAdminRef = ref();
onMounted(() => {
    getAdmin();
})
</script>
<template>
    <div class="bg-white rounded-4 p-4 flex-1 overflow-hidden flex flex-column">
        <div class="flex pb-4">
            <el-tooltip effect="dark" content="创建管理员" placement="bottom-end">
                <el-button type="primary" icon="Plus" @click="createAdminRef.open()">创建</el-button>
            </el-tooltip>
            <div class="flex-1"></div>
        </div>
        <el-table :data="tableData" style="width: 100%;height: 100%;" border>
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column label="头像" width="100">
                <template #default="scope">
                    <el-image v-if="scope.row.avatar_url" style="width: 40px; height: 40px" class="rounded-4"
                        :src="scope.row.avatar_url" :zoom-rate="1.2" preview-teleported
                        :preview-src-list="[scope.row.avatar_url]" fit="cover" />
                </template>
            </el-table-column>
            <el-table-column label="管理员" width="200">
                <template #default="scope">
                    <div>
                        <div class="font-weight-600">{{ scope.row.nickname }}</div>
                        <div class="text-primary">{{ scope.row.username }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="角色" width="200">
                <template #default="scope">
                    <el-tag>{{ scope.row.role_name }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="联系方式" min-width="240">
                <template #default="scope">
                    <div>
                        <div class="font-weight-600">{{ scope.row.mobile }}</div>
                        <div class="font-weight-600">{{ scope.row.email }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="工作时间" min-width="260">
                <template #default="scope">
                    <div>
                        <el-tag size="small" type="success" v-for="item in scope.row.allow_week">{{ weekText[item]
                        }}</el-tag>
                        <div class="flex flex-y-center">
                            <el-tag size="small" type="info">{{ scope.row.allow_time_start }}</el-tag>
                            <div>~</div>
                            <el-tag size="small" type="info">{{ scope.row.allow_time_end }}</el-tag>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
                <template #default="scope">
                    <el-switch v-model="scope.row.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" :loading="scope.row.state_loading"
                        @change="SetState(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="创建/登录/在线时间" width="200">
                <template #default="scope">
                    <div class="h10">
                        <div>{{ scope.row.create_time }}</div>
                        <div>{{ scope.row.login_time }}</div>
                        <div>{{ scope.row.online_time }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="#" width="160">
                <template #default="scope">
                    <el-tooltip effect="dark" content="编辑" placement="left">
                        <el-button type="primary" icon="Edit" size="small"
                            @click="createAdminRef.open(scope.row)"></el-button>
                    </el-tooltip>
                    <el-popconfirm icon="Delete" icon-color="var(--el-color-danger)"
                        title="不建议删除管理员，建议禁用管理员，删除可能会造成数据混乱，是否继续删除？" width="200px" confirm-button-text="继续删除"
                        confirm-button-type="danger" @confirm="deleteData(scope)" v-if="!scope.row.is_system">
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
        <create-admin ref="createAdminRef" @success="getAdmin" />
    </div>
</template>