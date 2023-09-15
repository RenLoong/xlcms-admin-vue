<script lang="ts" setup>
import { $http } from '@/common/common'
import { ElMessage } from 'element-plus'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { useUserStore } from '@/stores';
import router from '@/routers';
const { getToken } = useUserStore();
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const toolbarConfig = {}
const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
        uploadImage: {
            server: $http.baseURL + '/uploads',
            // form-data fieldName ，默认值 'wangeditor-uploaded-image'
            fieldName: 'file',

            // 单个文件的最大体积限制，默认为 2M
            maxFileSize: 1 * 1024 * 1024, // 1M

            // 最多可上传几个文件，默认为 100
            maxNumberOfFiles: 10,

            // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
            allowedFileTypes: ['image/*'],

            // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
            meta: {
                action: 'editor/image'
            },
            // 自定义增加 http  header
            headers: {
                Authorization: getToken(),
            },

        }
    }
}
const mode = 'default';
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}
const rules = reactive({
    cid: [{ required: true, message: '请选择分类', trigger: 'change' }],
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入内容', trigger: 'change' }],
})
const form = ref<{
    id?: number
    classify_alias?: string
    start_time: string
    end_time: string
    alias: string
    title: string
    subtitle: string
    state: number
    view: number
    thumb: string[]
    thumb_url: string[]
    class: string
    source: string
    desc: string
    cid?: number
    sort: number
    content: string
}>({
    classify_alias: router.currentRoute.value.query.classify_alias as string,
    start_time: '',
    end_time: '',
    alias: '',
    title: '',
    subtitle: '',
    state: 1,
    view: 0,
    thumb: [],
    thumb_url: [],
    class: '',
    source: '',
    desc: '',
    cid: undefined,
    sort: 99,
    content: ''
})
const handleRemove = (index: number) => {
    form.value.thumb.splice(index, 1);
    form.value.thumb_url.splice(index, 1);
}
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
        if (file.action === 'article/thumb') {
            form.value.thumb.push(file.path);
            form.value.thumb_url.push(file.url);
        }
    } else {
        ElMessage.error(ret.message);
    }
}
const formRef = ref();
const submitForm = () => {
    formRef.value.validate((valid: boolean, _fields: any) => {
        if (valid) {
            let url = 'article/index/Add';
            if (form.value.id) {
                url = 'article/index/Edit';
            }
            $http.post(url, form.value).then((ret: any) => {
                if (ret.code === $http.ResponseCode.SUCCESS) {
                    ElMessage.success(ret.message);
                    if (!form.value.id) {
                        resetForm();
                    }
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
const pidData = ref([]);
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
const getRead = () => {
    const id = router.currentRoute.value.query.id;
    if (id) {
        $http.get('article/index', { params: { id } }).then((ret: any) => {
            if (ret.code === $http.ResponseCode.SUCCESS) {
                form.value = ret.data;
            } else {
                ElMessage.info(ret.message);
            }
        }).catch((err: any) => {
            ElMessage.error(err.message);
        })
    }
}
onBeforeMount(() => {
    getSelect();
})
onActivated(() => {
    getRead();
})
</script>
<template>
    <div class="bg-white rounded-4 flex-1 overflow-auto flex flex-column pt-6">
        <el-form class="flex-1" :model="form" :rules="rules" size="large" label-width="200px" ref="formRef"
            @submit.prevent="submitForm">
            <div class="layouts">
                <div class="flex font-weight-600 p-6 position-sticky bg-white top--6 z-index">基础信息</div>
                <el-form-item label="所属分类" prop="cid" v-if="!router.currentRoute.value.query.classify_alias">
                    <el-select v-model="form.cid" placeholder="默认为顶级分类" clearable class="flex-1">
                        <xlcms-el-option :list="pidData" :showicon="false"></xlcms-el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="文章标题" />
                </el-form-item>
                <el-form-item label="副标题" prop="subtitle">
                    <el-input v-model="form.subtitle" placeholder="文章副标题" />
                </el-form-item>
                <el-form-item label="封面" prop="thumb">
                    <div v-for="(item, index) in form.thumb_url" class="thumb-uploader-list mr-4 bg-hover rounded-4">
                        <el-image :src="item" class="el-upload-list__item-thumbnail" fit="contain"
                            :preview-src-list="form.thumb_url" />
                        <span class="el-upload-list__item-actions bg-filter p-4 rounded-4" @click="handleRemove(index)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </span>
                    </div>
                    <uploads accept="image/jpeg,image/png,image/jpg" :data="{
                        action: 'article/thumb'
                    }" :show-file-list="false" list-type="picture-card" :on-success="handleUploadSuccess"
                        :before-upload="beforeUpload" class="thumb-uploader" v-if="form.thumb.length < 5">
                        <div class="line-height-1 text-center">
                            <el-icon>
                                <Picture />
                            </el-icon>
                            <div class="h10 text-grey">{{ form.thumb.length }}/5</div>
                        </div>
                    </uploads>
                    <div class="line-height-2 pt-2 text-grey h10 w-100">
                        <div>请上传2M以内格式为“jpg，png”的图片</div>
                    </div>
                </el-form-item>
                <el-form-item label="来源" prop="source">
                    <el-input v-model="form.source" placeholder="文章来源" />
                </el-form-item>
                <el-form-item label="描述" prop="desc">
                    <el-input type="textarea" v-model="form.desc" :autosize="{ minRows: 5 }" placeholder="文章描述" />
                </el-form-item>
                <div class="flex font-weight-600 p-6 position-sticky bg-white top--6 z-index">扩展信息</div>
                <el-form-item label="别名" prop="alias">
                    <el-input v-model="form.alias" placeholder="别名" />
                </el-form-item>
                <el-form-item label="扩展样式" prop="class">
                    <el-input v-model="form.class" placeholder="扩展样式" />
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
                <el-form-item label="状态" prop="state">
                    <el-switch v-model="form.state" :active-value="1" :inactive-value="0"
                        style="--el-switch-on-color: var(--el-color-success);" />
                </el-form-item>
                <el-form-item label="浏览量" prop="view">
                    <el-input-number v-model="form.view" :min="0" placeholder="浏览量" :controls="false" />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="form.sort" :min="0" :max="99" placeholder="排序正序" :controls="false" />
                </el-form-item>
                <div class="flex font-weight-600 p-6 position-sticky bg-white top--6 z-index">文章内容</div>
                <el-form-item label="文章内容" prop="content">
                    <div class="border z-index-1001">
                        <Toolbar class="border-bottom" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
                        <Editor style="min-height:500px;height: 100vh;" v-model="form.content" :defaultConfig="editorConfig"
                            :mode="mode" @onCreated="handleCreated" />
                    </div>
                </el-form-item>
            </div>
        </el-form>
        <div class="flex flex-center py-6 position-sticky bg-white bottom--2" style="z-index: 100;">
            <el-button @click="resetForm" size="large">重置</el-button>
            <div class="mx-10"></div>
            <el-button type="primary" @click="submitForm" size="large">提交</el-button>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.z-index-1001.w-e-full-screen-container {
    z-index: 1001;
}
</style>
