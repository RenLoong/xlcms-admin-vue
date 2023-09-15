<script setup lang="ts">
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
const roleForm = ref();
const authDataEl = ref();
const showAdd = ref(false);
const roleData = ref([]);
const authData = ref<any[]>([]);
const rules = reactive({
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' },],
})
const form = ref<{
    id?: number,
    pid?: number,
    name: string,
    state: number,
    rule: any[]
}>({
    id: undefined,
    pid: undefined,
    name: '',
    state: 1,
    rule: []
});

const customNodeClass = (data: any, _node: any): string => {
    if (data.son_auth) {
        return 'is-penultimate'
    }
    return '';
}
const getAuthData = () => {
    $http.get('auth/index', {
        params: {
            action: 'tree'
        }
    }).then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            authData.value = ret.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    });
}
const getRoleSelect = () => {
    $http.get('role/index').then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            roleData.value = ret.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    });
}
const handleOpen = () => {
    let rule: any[] = [];
    form.value.rule.map((item: any) => {
        rule.push({ id: item });
    })
    authDataEl.value.setCheckedNodes(rule);
}
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = undefined;
    form.value.rule = [];
    handleOpen();
    done();
}
const submitForm = () => {
    let rule: any[] = [];
    authDataEl.value.getCheckedNodes(false, true).map((item: any) => {
        rule.push(item.id);
    })
    form.value.rule = rule;
    roleForm.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            let url = 'role/index/Add';
            if (form.value.id) {
                url = 'role/index/Edit';
            }
            $http.post(url, form.value).then((ret: any) => {
                if (ret.code === $http.ResponseCode.SUCCESS) {
                    ElMessage.success(ret.message);
                    handleClose(() => {
                        showAdd.value = false;
                    })
                    emit('success');
                } else {
                    ElMessage.info(ret.message);
                }
            }).catch((err: any) => {
                ElMessage.error(err.message);
            })
        } else {
            ElMessage.warning('请完善表单');
        }
    })
}
const resetForm = () => {
    if (!roleForm.value) return
    roleForm.value.resetFields();
}
const open = (options?: any) => {
    getRoleSelect();
    getAuthData();
    showAdd.value = true;
    if (options) {
        nextTick(() => {
            form.value = Object.assign({}, options);
        });
    }
}
const emit = defineEmits(['success'])
defineExpose({
    open
})
</script>
<template>
    <el-dialog v-model="showAdd" :title="form.id ? '编辑角色' : '创建角色'" width="50%" :before-close="handleClose"
        @opened="handleOpen" draggable :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <el-form label-position="right" label-width="200px" size="large" ref="roleForm" class="w-80" :model="form"
            :rules="rules">
            <el-form-item label="上级角色">
                <el-select v-model="form.pid" placeholder="默认为部门" clearable class="flex-1">
                    <xlcms-el-option :list="roleData" :showicon="false"></xlcms-el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="角色名称" />
            </el-form-item>
            <el-form-item label="规则" prop="rule">
                <el-tree ref="authDataEl" :data="authData" node-key="id" :props="{ label: 'title', class: customNodeClass }"
                    default-expand-all show-checkbox class="w-100" />
            </el-form-item>
            <el-form-item label="状态" prop="state">
                <el-switch v-model="form.state" :active-value="1" :inactive-value="0"
                    style="--el-switch-on-color: var(--el-color-success);" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer flex">
                <el-button @click="handleClose(() => {
                    showAdd = false;
                })">取消</el-button>
                <div class="flex-1"></div>
                <el-button @click="resetForm()">重置</el-button>
                <el-button type="primary" @click="submitForm()">提交</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<style>
.el-tree-node.is-expanded.is-penultimate>.el-tree-node__children {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.is-penultimate>.el-tree-node__children>div {
    width: 25%;
}
</style>