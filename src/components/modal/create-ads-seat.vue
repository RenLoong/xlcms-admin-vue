<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
import { ads_seat_alias } from "@/common/config";
const formRef = ref();
const rules = reactive({
    alias: [{ required: true, message: '请选择排版', trigger: 'change' },],
    title: [{ required: true, message: '请输入名称', trigger: 'blur' },],
    seat: [{ required: true, message: '请输入广告位标识', trigger: 'blur' },],
})
const showAdd = ref(false);
const form = ref<{
    id?: number,
    title: string,
    seat: string,
    alias: string,
    w: string,
    h: string,
    interval: number,
    duration: number,
    indicator_color?: string,
    indicator_active_color?: string,
    autoplay: number,
    state: number
}>({
    title: '',
    seat: '',
    alias: '',
    w: '',
    h: '',
    interval: 3000,
    duration: 500,
    autoplay: 1,
    state: 1
})
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = undefined;
    done();
}
const submitForm = () => {
    formRef.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            let url = 'ads/seat/Add';
            if (form.value.id) {
                url = 'ads/seat/Edit';
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
const open = (options?: any) => {
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
    <el-dialog v-model="showAdd" :title="form.id ? '编辑广告位' : '创建广告位'" width="50%" :before-close="handleClose" draggable
        :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <el-form label-position="right" label-width="200px" size="large" ref="formRef" class="w-80" :model="form"
            :rules="rules">
            <el-form-item label="排版" prop="alias">
                <el-select v-model="form.alias" placeholder="选择广告位排版" class="w-100">
                    <el-option v-for="item in ads_seat_alias" :key="item.alias" :label="item.title"
                        :value="item.alias"></el-option>
                </el-select>
                <div class="text-grey h10">排版并非每个位置支持，由开发者定义</div>
            </el-form-item>
            <el-form-item label="名称" prop="title">
                <el-input v-model="form.title" placeholder="广告位名称" />
            </el-form-item>
            <el-form-item label="标识" prop="seat">
                <el-input v-model="form.seat" placeholder="广告位标识" />
                <div class="text-grey h10">可通过广告位标识获取该位置下的广告</div>
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
            <el-form-item label="状态" prop="state">
                <el-switch v-model="form.state" :active-value="1" :inactive-value="0"
                    style="--el-switch-on-color: var(--el-color-success);" />
            </el-form-item>
            <div v-if="form.alias.includes('SWIPER')">
                <el-form-item label="切换时间" prop="interval">
                    <el-input-number v-model="form.interval" :min="1000" placeholder="自动切换时间间隔" :controls="false" />
                </el-form-item>
                <el-form-item label="动画时长" prop="duration">
                    <el-input-number v-model="form.duration" :min="100" placeholder="滑动动画时长" :controls="false" />
                </el-form-item>
                <el-form-item label="指示点颜色" prop="indicator_color">
                    <el-color-picker v-model="form.indicator_color" placeholder="指示点颜色" show-alpha />
                </el-form-item>
                <el-form-item label="选中指示点颜色" prop="indicator_active_color">
                    <el-color-picker v-model="form.indicator_active_color" placeholder="当前选中的指示点颜色" show-alpha />
                </el-form-item>
                <el-form-item label="自动切换" prop="autoplay">
                    <el-switch v-model="form.autoplay" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" />
                </el-form-item>
            </div>
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