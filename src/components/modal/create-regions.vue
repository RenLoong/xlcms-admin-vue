<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
const showAdd = ref(false);
const regionsData = ref([]);
const regionsForm = ref();
const pidRef = ref();
const rules = reactive({
    id: [{ required: true, message: '请输入地区代码', trigger: 'blur' },],
    title: [{ required: true, message: '请输入地区名称', trigger: 'blur' },],
    level: [{ required: true, message: '请选择行政等级', trigger: 'change' },],
    state: [{ required: true, message: '请选择状态', trigger: 'change' },],
})
const form = ref<{
    id?: number,
    pid?: number,
    pid_arr?: number[],
    title?: string,
    pinyin_prefix?: string,
    level?: number,
    state?: number,
}>({
    pid_arr: [],
    title: '',
    pinyin_prefix: '',
    level: 0,
    state: 1,
})

const getRegionsSelect = () => {
    $http.get('regions/list').then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            regionsData.value = ret.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    });
}
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = undefined;
    done();
}
const submitForm = () => {
    regionsForm.value.validate((valid: boolean) => {
        if (valid) {
            let url = 'regions/list/Edit';
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
    if (!regionsForm.value) return
    regionsForm.value.resetFields();
}
const handleChange = (val: any) => {
    form.value.pid = val[val.length - 1];
}
const open = (options?: any) => {
    if (regionsData.value.length <= 0) {
        getRegionsSelect();
    }
    showAdd.value = true;
    if (options) {
        nextTick(() => {
            form.value = Object.assign({}, options);
        });
    }
}
const emit = defineEmits(['success'])
defineExpose({ open })
</script>
<template>
    <el-dialog v-model="showAdd" title="编辑地区" width="50%" :before-close="handleClose" draggable
        :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <el-form label-position="right" label-width="200px" size="large" ref="regionsForm" class="w-80" :model="form"
            :rules="rules">
            <el-form-item label="上级地区">
                <el-cascader ref="pidRef" v-model="form.pid_arr" :options="regionsData"
                    :props="{ value: 'id', label: 'title' }" @change="handleChange" placeholder="默认为省" clearable
                    class="flex-1" />
            </el-form-item>
            <el-form-item label="地区代码" prop="id">
                <el-input v-model="form.id" placeholder="地区代码" />
            </el-form-item>
            <el-form-item label="名称" prop="title">
                <el-input v-model="form.title" placeholder="地区名称" />
            </el-form-item>
            <el-form-item label="首字母" prop="pinyin_prefix">
                <el-input v-model="form.pinyin_prefix" placeholder="地区首字母" />
            </el-form-item>
            <el-form-item label="行政等级" prop="level">
                <el-radio-group v-model="form.level">
                    <el-radio :label="0">省</el-radio>
                    <el-radio :label="1">市</el-radio>
                    <el-radio :label="2">区</el-radio>
                    <el-radio :label="3">街道</el-radio>
                </el-radio-group>
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