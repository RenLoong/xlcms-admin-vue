<script setup lang="ts">
import router from '@/routers';

</script>

<template>
    <main class="layouts flex flex-center layouts-empty">
        <el-empty description="404，小伙伴你迷路了哦">
            <el-button type="primary" @click="router.go(-1)">上一页</el-button>
            <el-button type="default" @click="router.push('/')">返回首页</el-button>
        </el-empty>
    </main>
</template>

<style scoped></style>
