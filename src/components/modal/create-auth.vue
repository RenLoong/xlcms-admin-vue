<script lang="ts" setup>
import * as Icons from "@element-plus/icons-vue";
import hljs from 'highlight.js/lib/core';
import php from 'highlight.js/lib/languages/php';
import { son_auth } from '@/common/config';
import { ElMessage } from 'element-plus'
import { $http } from "@/common/common";
hljs.registerLanguage('php', php);
const authForm = ref();
const showAdd = ref(false);
const checkAll = ref(false);
const isIndeterminate = ref(false);
const classcode = ref('');
const iconsList = ref<string[]>([]);
const authData = ref<any[]>([]);
for (const key in Icons) {
    if (Object.hasOwnProperty.call(Icons, key)) {
        iconsList.value.push(key);
    }
}
const getAuthSelect = () => {
    $http.get('auth/index').then((ret: any) => {
        if (ret) {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                authData.value = ret.data;
            } else {
            }
        }
    }).catch((err: any) => {
        ElMessage.error(err.message);
    });
}
const rules = reactive({
    title: [{ required: true, message: '请输入名称', trigger: 'blur' },],
    url: [{ required: true, message: '请输入规则', trigger: 'blur' },],
})
const form = ref<{
    id: any;
    pid: any;
    title: string;
    icon: string;
    controller: string;
    action: string;
    url: string;
    is_show: number;
    state: number;
    sort: number;
    son_auth: any[];
}>({
    id: null,
    pid: null,
    title: '',
    icon: '',
    controller: '',
    action: '',
    url: '',
    is_show: 0,
    state: 1,
    sort: 99,
    son_auth: []
})
const open = (options?: any) => {
    getAuthSelect();
    showAdd.value = true;
    if (options) {
        nextTick(() => {
            form.value = Object.assign({}, options);
            checkAll.value = form.value.son_auth.length === son_auth.length;
            isIndeterminate.value = form.value.son_auth.length > 0 && form.value.son_auth.length < son_auth.length;
            initClassCode();
        });
    }
}
const handleClose = (done: Function) => {
    resetForm();
    form.value.id = null;
    done();
}
const submitForm = () => {
    authForm.value.validate((valid: any, _fields: any) => {
        if (valid) {
            let url = 'auth/index/Add';
            if (form.value.id) {
                url = 'auth/index/Edit';
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
            }).catch(err => {
                ElMessage.error(err.message);
            })
        } else {
            ElMessage.warning('请完善表单');
        }
    })
}
const resetForm = () => {
    if (!authForm.value) return
    authForm.value.resetFields()
}
const handleCheckAllChange = (val: any) => {
    let temp: any[] = [];
    if (val) {
        son_auth.forEach((item: { action: any; }) => {
            temp.push(item.action);
        })
    }
    form.value.son_auth = temp;
    isIndeterminate.value = false;
    initClassCode();
}
const handleCheckedCitiesChange = (value: any[]) => {
    const checkedCount = value.length
    checkAll.value = checkedCount === son_auth.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < son_auth.length
    initClassCode();
}
const initClassCode = () => {
    if (form.value.controller && form.value.action) {
        let func = '';
        func += `    public function ${form.value.action}(){}\n`;
        form.value.son_auth.forEach((item: any) => {
            func += `    public function ${form.value.action}${item}(){}\n`;
        })
        classcode.value = hljs.highlight(`<?php \n/**\n* 服务端需要实现以下类与方法\n*/\nclass ${form.value.controller} \n{\n${func}}`, { language: 'php' }).value
    } else {
        classcode.value = '';
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
        <el-form label-position="right" label-width="200px" size="large" ref="authForm" class="w-80" :model="form"
            :rules="rules">
            <el-form-item label="上级菜单" prop="pid">
                <el-select v-model="form.pid" placeholder="默认为顶级菜单" clearable class="flex-1">
                    <xlcms-el-option :list="authData" :showicon="false"></xlcms-el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="名称" prop="title">
                <el-input v-model="form.title" placeholder="权限菜单名称" />
            </el-form-item>
            <el-form-item label="规则" prop="url">
                <el-input v-model="form.url" placeholder="WEB端用作路由，服务端用作API，无需‘/’开头" />
                <div class="text-grey">WEB端用作路由，服务端用作API，无需‘/’开头</div>
            </el-form-item>
            <el-form-item label="控制器/操作">
                <div class="flex w-100">
                    <el-form-item prop="controller">
                        <el-input v-model="form.controller" placeholder="控制器类名" @input="initClassCode" />
                    </el-form-item>
                    <div class="mx-1 text-grey">/</div>
                    <el-form-item prop="action">
                        <el-input v-model="form.action" placeholder="操作名" @input="initClassCode" />
                    </el-form-item>
                </div>
                <div class="text-grey">作为服务端API验权使用</div>
            </el-form-item>
            <el-form-item label="子权限" prop="son_auth">
                <div class="w-100 flex">
                    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate"
                        @change="handleCheckAllChange">全选</el-checkbox>
                    <div class="text-grey ml-3">子权限建议放在最后一级</div>
                </div>
                <div class="w-100">
                    <el-checkbox-group v-model="form.son_auth" @change="handleCheckedCitiesChange">
                        <el-checkbox v-for="item in son_auth" :key="item.action" :label="item.action">{{ item.name
                        }}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="hljs w-100 p-3 line-height-1" v-show="classcode">
                    <pre v-html="classcode"></pre>
                </div>
            </el-form-item>
            <el-form-item label="图标" prop="icon">
                <el-icon v-if="form.icon" class="flex flex-center mr-4" style="width:30px;height: 30px;" size="24px"
                    color="#000010">
                    <component :is="form.icon"></component>
                </el-icon>
                <el-popover placement="top" :width="600" trigger="click">
                    <template #reference>
                        <el-button size="small" type="primary" icon="Search"></el-button>
                    </template>
                    <div class="flex flex-wrap overflow-y-auto" style="height:400px;">
                        <template v-for="icon in iconsList">
                            <el-icon class="flex flex-center pointer hover-bg rounded-2" style="width:50px;height: 50px;"
                                size="20px" color="#000010" @click="form.icon = icon">
                                <component :is="icon"></component>
                            </el-icon>
                        </template>
                    </div>
                </el-popover>
            </el-form-item>
            <el-form-item label="权重" prop="sort">
                <el-input-number v-model="form.sort" :min="0" :max="99" :step="1" step-strictly />
            </el-form-item>
            <el-form-item label="是否显示" prop="is_show">
                <el-switch v-model="form.is_show" :active-value="1" :inactive-value="0"
                    style="--el-switch-on-color: var(--el-color-success);" />
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
<style scoped lang="scss"></style>