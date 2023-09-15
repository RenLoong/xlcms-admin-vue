<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus';

const props = withDefaults(defineProps<{
    modelValue?: string | string[]
    action?: string
    limit?: number
}>(), {
    limit: 1,
    modelValue: '',
    action: 'x-upload/upload'
});
const emit = defineEmits(['update:modelValue', 'change']);
const valueList = ref<string[]>([]);
const value = ref<string>('');
watch(() => props.modelValue, (val) => {
    if (typeof val === 'string' && props.limit < 2) {
        value.value = val;
    } else {
        valueList.value = val as string[];
    }
})
const beforeUpload = (rawFile: any) => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(rawFile.type)) {
        ElMessage.error('请选择图片')
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('请选择2MB以内的图片!')
        return false
    }
    return true
}
const handleUploadSuccess = (ret: any) => {
    if (ret.code === $http.ResponseCode.SUCCESS) {
        const file = ret.data;
        if (file.action === props.action) {
            if (props.limit > 1) {
                valueList.value.push(file.url);
            } else {
                value.value = file.url;
            }
        }
    } else {
        ElMessage.error(ret.message);
    }
}
const handleRemove = (index?: number) => {
    if (props.limit > 1 && index !== undefined) {
        valueList.value.splice(index, 1);
    } else {
        value.value = '';
    }
}
watch(() => valueList.value, (val) => {
    emit('update:modelValue', val);
    emit('change', val);
})
watch(() => value.value, (val) => {
    emit('update:modelValue', val);
    emit('change', val);
})
</script>
<template>
    <div class="flex flex-wrap" v-if="props.limit > 1">
        <div v-for="(item, index) in valueList" class="thumb-uploader-list mr-4 bg-hover rounded-4">
            <el-image :src="item" class="el-upload-list__item-thumbnail" fit="contain" :preview-src-list="valueList" />
            <span class="el-upload-list__item-actions bg-filter p-4 rounded-4" @click="handleRemove(index)">
                <el-icon>
                    <Delete />
                </el-icon>
            </span>
        </div>
        <uploads accept="image/jpeg,image/png,image/jpg" :data="{ action: props.action }" :show-file-list="false"
            list-type="picture-card" :on-success="handleUploadSuccess" :before-upload="beforeUpload" class="thumb-uploader"
            v-if="valueList.length < props.limit">
            <div class="line-height-1 text-center">
                <el-icon>
                    <Picture />
                </el-icon>
                <div class="h10 text-grey">{{ valueList.length }}/{{ props.limit }}</div>
            </div>
        </uploads>
    </div>
    <div class="flex flex-wrap" v-else>
        <uploads accept="image/jpeg,image/png,image/jpg" :data="{ action: props.action }" :show-file-list="false"
            list-type="picture-card" :on-success="handleUploadSuccess" :before-upload="beforeUpload" class="thumb-uploader">
            <div class="thumb-uploader-list rounded-4" v-if="value">
                <el-image :src="value" class="el-upload-list__item-thumbnail" fit="contain" />
                <span class="el-upload-list__item-actions bg-filter p-4 rounded-4" @click.stop="handleRemove()">
                    <el-icon>
                        <Delete />
                    </el-icon>
                </span>
            </div>
            <div class="line-height-1 text-center" v-else>
                <el-icon>
                    <Picture />
                </el-icon>
            </div>
        </uploads>
    </div>
</template>