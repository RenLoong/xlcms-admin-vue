<script lang="ts" setup>
import { $http } from '@/common/common';
import { ElMessage } from 'element-plus'
import hljs from 'highlight.js/lib/core';
import php from 'highlight.js/lib/languages/php';
hljs.registerLanguage('php', php);
const apiForm = ref();
const showAdd = ref(false);
const classcode = ref('');
const rules = reactive({
    name: [{ required: true, message: '请输入名称', trigger: 'blur' },],
    app: [{ required: true, message: '请输入应用', trigger: 'blur' },],
    controller: [{ required: true, message: '请输入控制器', trigger: 'blur' },],
    action: [{ required: true, message: '请输入操作', trigger: 'blur' },],
    url: [{ required: true, message: '请输入URL', trigger: 'blur' },],
})
const form = ref({
    id: null,
    name: '',
    app: '',
    controller: '',
    action: '',
    url: '',
    state: 1,
    state_msg: '',
    is_login: 0,
})
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = null;
    done();
}
const submitForm = () => {
    apiForm.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            let url = 'client/api/Add';
            if (form.value.id) {
                url = 'client/api/Edit';
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
    if (!apiForm.value) return
    apiForm.value.resetFields();
    initClassCode();
}
const initClassCode = () => {
    if (form.value.app && form.value.controller && form.value.action && form.value.url) {
        const func = `    public function ${form.value.action}(){}\n`;
        classcode.value = hljs.highlight(`<?php \nnamespace app\\${form.value.app}\\controller;\n/**\n* 服务端需要实现以下类与方法\n*/\nclass ${form.value.controller} \n{\n${func}}`, { language: 'php' }).value
    } else {
        classcode.value = '';
    }
}
const open = (options?: any) => {
    showAdd.value = true;
    if (options) {
        nextTick(() => {
            form.value = Object.assign({}, options);
        });
    }
}
const emit = defineEmits(['success']);
defineExpose({
    open
})
</script>
<template>
    <el-dialog v-model="showAdd" :title="form.id ? '编辑规则' : '创建规则'" width="50%" :before-close="handleClose" draggable
        :close-on-click-modal="false" :close-on-press-escape="false" class="form-dialog">
        <el-form label-position="right" label-width="200px" size="large" ref="apiForm" class="w-80" :model="form"
            :rules="rules">
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" placeholder="接口名称" />
            </el-form-item>
            <el-form-item label="URL" prop="url">
                <el-input v-model="form.url" placeholder="服务端用作API，无需‘/’开头" />
            </el-form-item>
            <el-form-item label="控制器/操作">
                <div class="flex w-100">
                    <el-form-item prop="app">
                        <el-input v-model="form.app" placeholder="应用名" @input="initClassCode" />
                    </el-form-item>
                    <div class="mx-1 text-grey">/</div>
                    <el-form-item prop="controller">
                        <el-input v-model="form.controller" placeholder="控制器类名" @input="initClassCode" />
                    </el-form-item>
                    <div class="mx-1 text-grey">/</div>
                    <el-form-item prop="action">
                        <el-input v-model="form.action" placeholder="操作名" @input="initClassCode" />
                    </el-form-item>
                </div>
            </el-form-item>
            <el-form-item label="是否需要登录" prop="is_login">
                <el-switch v-model="form.is_login" :active-value="1" :inactive-value="0"
                    style="--el-switch-on-color: var(--el-color-success);" />
            </el-form-item>
            <el-form-item label="状态" prop="state">
                <el-switch v-model="form.state" :active-value="1" :inactive-value="0"
                    style="--el-switch-on-color: var(--el-color-success);" />
            </el-form-item>
            <el-form-item label="禁用提示" prop="state_msg" v-if="!form.state">
                <el-input type="textarea" v-model="form.state_msg" placeholder="禁用提示" />
            </el-form-item>
            <el-form-item label="代码预览" prop="son_api">
                <div class="hljs w-100 p-3 line-height-1" v-show="classcode">
                    <pre v-html="classcode"></pre>
                </div>
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