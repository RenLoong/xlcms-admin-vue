<script lang="ts" setup>
import { $http } from '@/common/common';
import { useUserStore } from '@/stores';
const { getToken } = useUserStore();
const getHeaders = () => {
    const headers = ref<{
        Authorization?: string,
        'Yc-devmode': string
    }>({
        Authorization: getToken(),
        ['Yc-devmode']: ''
    })
    if (import.meta.env.DEV) {
        headers.value['Yc-devmode'] = 'true';
    }
    return headers.value
}
</script>
<template>
    <el-upload :headers="getHeaders()" :action="$http.baseURL + '/uploads'">
        <template #tip>
            <slot name="tip" />
        </template>
        <template #file="{ file }">
            <slot name="file" :file="file" />
        </template>
        <slot />
    </el-upload>
</template>
<style></style>