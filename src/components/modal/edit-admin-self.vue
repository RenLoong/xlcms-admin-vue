<script lang="ts" setup>
import { $http } from '@/common/common';
import { getUserInfo } from '@/common/functions/request';
import { ElMessage } from 'element-plus'
const adminForm = ref();
const rules = reactive({
    nickname: [{ required: true, message: '请输入管理员昵称', trigger: 'blur' },],
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' },],
})
const showAdd = ref(false);
const form = ref<{
    nickname: string,
    avatar: string,
    avatar_url: string,
    username: string,
    password: string,
    mobile: string,
    email: string,
}>({
    nickname: '',
    avatar: '',
    avatar_url: '',
    username: '',
    password: '',
    mobile: '',
    email: '',
})
const handleClose = (done: Function) => {
    resetForm();
    form.value.avatar_url = '';
    done();
}
const submitForm = () => {
    adminForm.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            $http.post('admin/editSelf', form.value).then((ret: any) => {
                if (ret.code === $http.ResponseCode.SUCCESS) {
                    ElMessage.success(ret.message);
                    getUserInfo();
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
    if (!adminForm.value) return
    adminForm.value.resetFields();
}
const beforeAvatarUpload = (rawFile: any) => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(rawFile.type)) {
        ElMessage.error('请选择图片')
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('请选择2MB以内的图片!')
        return false
    }
    return true
}
const handleAvatarSuccess = (ret: any) => {
    if (ret.code === $http.ResponseCode.SUCCESS) {
        const file = ret.data;
        if (file.action === 'admin/avatar') {
            form.value.avatar = file.path;
            form.value.avatar_url = file.url;
        }
    } else {
        ElMessage.error(ret.message);
    }
}
const open = (options?: any) => {
    showAdd.value = true;
    if (options) {
        nextTick(() => {
            form.value = Object.assign({
                password: '',
            }, options);
        });
    }
}
const emit = defineEmits(['success']);
defineExpose({
    open
})
</script>
<template>
    <el-dialog v-model="showAdd" title="账户信息" width="50%" :before-close="handleClose" draggable
        :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <el-form label-position="right" label-width="200px" size="large" ref="adminForm" class="w-80" :model="form"
            :rules="rules">
            <el-form-item prop="avatar">
                <uploads accept="image/jpeg,image/png,image/jpg" :data="{
                    action: 'admin/avatar'
                }" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
                    class="mx-auto mb-10">
                    <img v-if="form.avatar_url" :src="form.avatar_url" class="rounded-circle" height="200" width="200" />
                    <el-icon v-else class="bg-hover rounded-circle flex flex-center" style="height: 200px;width: 200px;"
                        size="84px" color="#999999">
                        <Avatar />
                    </el-icon>
                </uploads>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
                <el-input v-model="form.nickname" placeholder="管理员昵称" />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" placeholder="管理员登录账号" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" placeholder="不填则不修改密码" />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="form.mobile" placeholder="联系手机号" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="联系邮箱" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer flex">
                <el-button @click="handleClose(() => {
                    showAdd = false;
                })">取消</el-button>
                <div class="flex-1"></div>
                <el-button type="primary" @click="submitForm()">提交</el-button>
            </span>
        </template>
    </el-dialog>
</template>