<script setup lang="ts">
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
const roleForm = ref();
const showAdd = ref(false);
const pidData = ref([]);
const rules = reactive({
    title: [{ required: true, message: '请输入分类名称', trigger: 'blur' },],
})
const form = ref<{
    id?: number,
    pid?: number,
    title: string,
    alias: string,
    sort: number,
    state: number,
}>({
    title: '',
    pid: undefined,
    alias: '',
    sort: 99,
    state: 1
});
const getSelect = () => {
    $http.get('article/classify').then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            pidData.value = ret.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    });
}
const handleOpen = () => {
}
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = undefined;
    handleOpen();
    done();
}
const submitForm = () => {
    roleForm.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            let url = 'article/classify/Add';
            if (form.value.id) {
                url = 'article/classify/Edit';
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
    getSelect();
    showAdd.value = true;
    if (options) {
        nextTick(() => {
            form.value = Object.assign(form.value, options);
        });
    }
}
const emit = defineEmits(['success'])
defineExpose({
    open
})
</script>
<template>
    <el-dialog v-model="showAdd" :title="form.id ? '编辑分类' : '创建分类'" width="50%" :before-close="handleClose"
        @opened="handleOpen" draggable :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <el-form label-position="right" label-width="200px" size="large" ref="roleForm" class="w-80" :model="form"
            :rules="rules">
            <el-form-item label="上级分类">
                <el-select v-model="form.pid" placeholder="默认为顶级分类" clearable class="flex-1">
                    <xlcms-el-option :list="pidData" :showicon="false"></xlcms-el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="名称" prop="title">
                <el-input v-model="form.title" placeholder="分类名称" />
            </el-form-item>
            <el-form-item label="别名" prop="alias">
                <el-input v-model="form.alias" placeholder="分类别名" />
                <div class="text-grey h10 line-height-2 pt-2">
                    <div>可通过别名获取该分类下的文章</div>
                </div>
            </el-form-item>
            <el-form-item label="排序" prop="sort">
                <el-input-number v-model="form.sort" :min="0" :max="99" placeholder="排序正序" :controls="false" />
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