<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
import { weekText } from "@/common/config";
const adminForm = ref();
const rules = reactive({
    admin_role_id: [{ required: true, message: '请选择角色', trigger: 'change' },],
    nickname: [{ required: true, message: '请输入管理员昵称', trigger: 'blur' },],
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' },],
    time: [{ required: true, message: '请设置工作时间', trigger: 'change' },],
})
let start = new Date();
start.setHours(0);
start.setMinutes(0);
start.setSeconds(0);
let end = new Date();
end.setHours(23);
end.setMinutes(59);
end.setSeconds(59);
const time = ref<[Date, Date]>([start, end]);
const showAdd = ref(false);
const checkAll = ref(false);
const isIndeterminate = ref(true);
const roleData = ref([]);
const form = ref<{
    id?: number,
    admin_role_id?: number,
    nickname: string,
    avatar: string,
    avatar_url: string,
    username: string,
    password: string,
    mobile: string,
    email: string,
    is_system: number,
    state: number,
    time: [Date, Date],
    allow_time_start: string,
    allow_time_end: string,
    allow_week: number[],
}>({
    id: undefined,
    admin_role_id: undefined,
    nickname: '',
    avatar: '',
    avatar_url: '',
    username: '',
    password: '',
    mobile: '',
    email: '',
    is_system: 0,
    state: 1,
    time: time.value,
    allow_time_start: '08:00:00',
    allow_time_end: '18:00:00',
    allow_week: [1, 2, 3, 4, 5],
})
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
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = undefined;
    form.value.admin_role_id = undefined;
    form.value.avatar_url = '';
    form.value.is_system = 0;
    done();
}
const submitForm = () => {
    const start = form.value.time[0];
    const end = form.value.time[1];
    form.value.allow_time_start = `${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}`;
    form.value.allow_time_end = `${end.getHours()}:${end.getMinutes()}:${end.getSeconds()}`;

    adminForm.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            let url = 'admin/index/Add';
            if (form.value.id) {
                url = 'admin/index/Edit';
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
    if (!adminForm.value) return
    adminForm.value.resetFields();
}
const handleCheckAllChange = (val: any) => {
    if (val) {
        form.value.allow_week = [...Array(7)].map((_x, k) => k);
    } else {
        form.value.allow_week = [];
    }
    isIndeterminate.value = false;
}
const handleCheckedCitiesChange = (value: any) => {
    const checkedCount = value.length
    checkAll.value = checkedCount === weekText.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < weekText.length
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
    getRoleSelect();
    showAdd.value = true;
    if (options) {
        const startArr = options.allow_time_start.split(':');
        const endArr = options.allow_time_end.split(':');
        let start = new Date();
        start.setHours(startArr[0]);
        start.setMinutes(startArr[1]);
        start.setSeconds(startArr[2]);
        let end = new Date();
        end.setHours(endArr[0]);
        end.setMinutes(endArr[1]);
        end.setSeconds(endArr[2]);
        nextTick(() => {
            form.value = Object.assign({
                password: '',
                time: [start, end]
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
    <el-dialog v-model="showAdd" :title="form.id ? '编辑管理员' : '创建管理员'" width="50%" :before-close="handleClose" draggable
        :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <el-form label-position="right" label-width="200px" size="large" ref="adminForm" class="w-80" :model="form"
            :rules="rules">
            <el-form-item label="角色" prop="admin_role_id" v-if="!form.is_system">
                <el-select v-model="form.admin_role_id" placeholder="选择管理员所在的角色" class="flex-1">
                    <xlcms-el-option :list="roleData" :showicon="false"></xlcms-el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="头像" prop="avatar">
                <uploads accept="image/jpeg,image/png,image/jpg" :data="{
                    action: 'admin/avatar'
                }" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                    <img v-if="form.avatar_url" :src="form.avatar_url" class="rounded-4" height="100" width="100" />
                    <el-icon v-else class="bg-hover rounded-circle flex flex-center" style="height: 100px;width: 100px;"
                        size="42px" color="#999999">
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
                <el-input v-model="form.password" placeholder="管理员密码" />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="form.mobile" placeholder="联系手机号" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="联系邮箱" />
            </el-form-item>
            <el-form-item label="工作时间" prop="time">
                <el-time-picker v-model="form.time" is-range range-separator="-" start-placeholder="上班时间"
                    end-placeholder="下班时间" :disabled="!!form.is_system" />
            </el-form-item>
            <el-form-item label="工作周" prop="allow_week">
                <div class="w-100 flex">
                    <el-checkbox :disabled="!!form.is_system" v-model="checkAll" :indeterminate="isIndeterminate"
                        @change="handleCheckAllChange">全选</el-checkbox>
                    <div class="text-grey ml-3" v-if="form.allow_week.length >= 7">感谢你的付出。</div>
                </div>
                <div class="w-100">
                    <el-checkbox-group :disabled="!!form.is_system" v-model="form.allow_week"
                        @change="handleCheckedCitiesChange">
                        <el-checkbox v-for="(item, index) in weekText" :key="index" :label="index">{{ item
                        }}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </el-form-item>
            <el-form-item label="状态" prop="state">
                <el-switch v-model="form.state" :disabled="!!form.is_system" :active-value="1" :inactive-value="0"
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