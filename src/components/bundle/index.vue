<script lang="ts" setup>
import './index.scss';
const dialogVisible = ref(false);
const open = () => {
    dialogVisible.value = true;
    nextTick(() => {
        loadMoreRef.value && observer.observe(loadMoreRef.value);
    })
}
const loadMoreRef = ref();
const bundleBodyRef = ref();
const selected = ref<any[]>([]);
const selectedEdit = ref<any[]>([]);
const fileList = ref(0);
const loadingState = ref(false);

const canScroll = () => {
    return bundleBodyRef.value.scrollHeight > bundleBodyRef.value.clientHeight;
}
const load = () => {
    console.log('load');
    if (loadingState.value) return;
    loadingState.value = true;
    fileList.value += 10;
    setTimeout(() => {
        loadingState.value = false;
        console.log('load end');
        // 首次可能为达到滚动条件，需要判断是否从服务器加载完，如果没有则继续加载
        // !canScroll() && 判断服务器加载完
        if (!canScroll()) {
            load();
        }
    }, 1000);
}
const multiple: number = 3;
const isEdit = ref(false);
const handelSelected = (item: any) => {
    if (isEdit.value) {
        if (selectedEdit.value.includes(item)) {
            selectedEdit.value.splice(selectedEdit.value.indexOf(item), 1)
        } else {
            selectedEdit.value.push(item)
        }
    } else {
        if (multiple === 1) {
            selected.value[0] = item;
        } else {
            if (selected.value.includes(item)) {
                selected.value.splice(selected.value.indexOf(item), 1)
            } else if (multiple === 0 || selected.value.length < multiple) {
                selected.value.push(item)
            }
        }
    }
}

const observer = new IntersectionObserver((e) => {
    if (e[0].intersectionRatio <= 0) return;
    load();
});
onUnmounted(() => {
    loadMoreRef.value && observer.unobserve(loadMoreRef.value);
});
</script>
<template>
    <el-link type="primary" :underline="false" class="ml-4" @click="open()">修改</el-link>
    <el-dialog v-model="dialogVisible" title="Tips" width="70%" class="bundle-dialog" draggable append-to-body>
        <template #header>
            <div class="bundle-name">
                <div class="flex-1">附件分类</div>
                <el-icon :size="20" class="pointer">
                    <FolderAdd />
                </el-icon>
            </div>
            <div class="bundle-title">
                附件管理器
            </div>
        </template>
        <div class="categrory">
            <div v-for="item in 100" class="categrory-item" :class="{ 'active': item === 1 }">
                <el-icon color="#FBAC15">
                    <FolderOpened />
                </el-icon>
                <div class="categrory-item-title">分类名称</div>
                <el-icon class="delete-icon">
                    <Delete />
                </el-icon>
            </div>
        </div>
        <div class="bundle-body" ref="bundleBodyRef">
            <div class="file-item" v-for="item in fileList"
                :class="{ 'active': !isEdit && selected.includes(item), 'active-warning': isEdit && selectedEdit.includes(item) }"
                @click="handelSelected(item)">
                <img src="https://kfadmin.net/upload/apps_logo/681677857ebf834bf106cc67880e418f.png" class="file-thumb"
                    v-if="item % 3 === 0">
                <el-icon class="file-thumb" v-else>
                    <Document />
                </el-icon>
                <div class="file-name">dwafaefdwafaefdwafaefdwafaefdwafaef.jpg</div>
            </div>
            <div ref="loadMoreRef" class="load-more"></div>
        </div>
        <template #footer>
            <el-button type="success">上传</el-button>
            <el-button type="primary" v-if="isEdit" @click="isEdit = false">完成</el-button>
            <el-button v-else @click="isEdit = true">管理</el-button>
            <el-button v-if="isEdit">全选</el-button>
            <div class="flex-1"></div>
            <div class="btn-group" v-if="isEdit">
                <el-button type="warning" :disabled="selectedEdit.length <= 0">移动</el-button>
                <el-button type="danger" :disabled="selectedEdit.length <= 0">
                    删除({{ selectedEdit.length }})
                </el-button>
            </div>
            <div class="btn-group" v-else>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="dialogVisible = false" :disabled="selected.length <= 0">
                    确认选择({{ selected.length }})
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>