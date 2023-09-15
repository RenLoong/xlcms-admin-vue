<script lang="ts" setup>
const props = withDefaults(defineProps<{
    list: any
    showicon?: boolean
}>(), {
    list: [],
    showicon: true
});
</script>

<template>
    <template v-for="(item, index) in props.list">
        <el-option :label="item.title" :value="item.id">
            <span v-if="index === list.length - 1 && showicon">└</span>
            <span v-else-if="showicon">├</span>
            <span>{{ item.title }}</span>
        </el-option>
        <template v-if="item.children && item.children.length">
            <div class="pl-10">
                <xlcms-el-option :list="item.children"></xlcms-el-option>
            </div>
        </template>
    </template>
</template>

<style></style>
