<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
const formRef = ref();
const rules = reactive({
    pid: [{ required: true, message: '请选择广告位', trigger: 'change' },],
    path: [{ required: true, message: '请上传图片', trigger: 'change' },],
})
const showAdd = ref(false);
const seatData = ref([]);
const form = ref<{
    id?: number,
    pid?: number,
    title: string,
    w: string,
    h: string,
    path: string,
    path_url: string,
    url: string,
    action: string,
    alias_id: string,
    sort: number,
    ads_icon: number,
    state: number,
    start_time: string,
    end_time: string,
}>({
    title: '',
    w: '',
    h: '',
    path: '',
    path_url: '',
    url: '',
    action: '',
    alias_id: '',
    sort: 99,
    ads_icon: 0,
    state: 1,
    start_time: '',
    end_time: ''
})
const getSeatSelect = () => {
    $http.get('ads/seat').then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            seatData.value = ret.data;
        } else {
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    });
}
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = undefined;
    form.value.pid = undefined;
    form.value.path_url = '';
    done();
}
const submitForm = () => {
    formRef.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            let url = 'ads/list/Add';
            if (form.value.id) {
                url = 'ads/list/Edit';
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
    if (!formRef.value) return
    formRef.value.resetFields();
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
        if (file.action === 'ads/image') {
            form.value.path = file.path;
            form.value.path_url = file.url;
        }
    } else {
        ElMessage.error(ret.message);
    }
}
const open = (options?: any) => {
    getSeatSelect();
    showAdd.value = true;
    if (options) {
        nextTick(() => {
            form.value = Object.assign(form.value, options);
        });
    }
}
const emit = defineEmits(['success']);
defineExpose({
    open
})
</script>
<template>
    <el-dialog v-model="showAdd" :title="form.id ? '编辑广告' : '添加广告'" width="50%" :before-close="handleClose" draggable
        :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <div class="pr-10 vh-50 overflow-y-auto">
            <el-form label-position="right" label-width="200px" size="large" ref="formRef" :model="form" :rules="rules">
                <el-form-item label="广告位" prop="pid">
                    <el-select v-model="form.pid" placeholder="选择广告位" class="flex-1">
                        <xlcms-el-option :list="seatData" :showicon="false"></xlcms-el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="描述" prop="title">
                    <el-input v-model="form.title" placeholder="广告文字描述" />
                </el-form-item>
                <el-form-item label="图片" prop="path">
                    <uploads accept="image/jpeg,image/png,image/jpg" :data="{
                        action: 'ads/image'
                    }" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
                        class="w-100">
                        <el-image v-if="form.path_url" :src="form.path_url" class="rounded-4"
                            style="height: 200px;width: 100%;" fit="contain" />
                        <el-icon v-else class="bg-hover rounded-4 flex flex-center" style="height: 200px;width: 100%;"
                            size="42px" color="#999999">
                            <Picture />
                        </el-icon>
                    </uploads>
                </el-form-item>
                <el-form-item label="操作" prop="action">
                    <el-select v-model="form.action" placeholder="选择点击操作" class="flex-1" clearable>
                        <el-option label="打开文章页" value="#ARTICLE#" />
                        <el-option label="打开自定义链接" value="#DEFAULR#" />
                    </el-select>
                </el-form-item>
                <el-form-item label="链接" prop="url" v-if="form.action === '#DEFAULR#'">
                    <el-input type="url" v-model="form.url" placeholder="URL链接" />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="form.sort" :min="0" :max="99" placeholder="排序正序" :controls="false" />
                </el-form-item>
                <el-form-item label="宽高">
                    <div class="flex flex-center w-100">
                        <el-form-item prop="w" class="flex-1">
                            <el-input v-model="form.w" placeholder="宽度" />
                        </el-form-item>
                        <div class="px-4">-</div>
                        <el-form-item prop="h" class="flex-1">
                            <el-input v-model="form.h" placeholder="高度" />
                        </el-form-item>
                    </div>
                    <div class="text-grey h10 line-height-2 pt-2">
                        <div>宽高并非每个位置支持，由开发者定义，可通过广告位标识获取该位置下的广告</div>
                        <div>无单位默认为px，单位：vh,vw,px,rem,em,%</div>
                    </div>
                </el-form-item>
                <el-form-item label="广告图标" prop="ads_icon">
                    <el-switch v-model="form.ads_icon" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" />
                </el-form-item>
                <el-form-item label="状态" prop="state">
                    <el-switch v-model="form.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" />
                </el-form-item>
                <el-form-item label="时间控制">
                    <div class="flex flex-center w-100">
                        <el-form-item prop="start_time" class="flex-1">
                            <el-date-picker v-model="form.start_time" style="--el-date-editor-width:100%" type="datetime"
                                placeholder="开始时间" value-format="YYYY/MM/DD hh:mm:ss" />
                        </el-form-item>
                        <div class="px-4">-</div>
                        <el-form-item prop="end_time" class="flex-1">
                            <el-date-picker v-model="form.end_time" style="--el-date-editor-width:100%" class="w-100"
                                type="datetime" placeholder="结束时间" value-format="YYYY/MM/DD hh:mm:ss" />
                        </el-form-item>
                    </div>
                </el-form-item>
            </el-form>
        </div>
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