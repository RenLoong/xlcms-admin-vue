<script lang="ts" setup>
const props = withDefaults(defineProps<{
    auth: any
    level?: number
}>(), {
    auth: [],
    level: 1
});
</script>

<template>
    <template v-for="item in props.auth">
        <el-sub-menu :index="item.path" v-if="item.children && item.children.length">
            <template #title>
                <el-icon v-if="item.icon">
                    <component :is="item.icon"></component>
                </el-icon>
                <span>{{ item.title }}</span>
            </template>
            <xlcms-el-menu-item :auth="item.children" :level="level + 1"></xlcms-el-menu-item>
        </el-sub-menu>
        <el-menu-item :index="item.path" v-else>
            <el-icon v-if="item.icon">
                <component :is="item.icon"></component>
            </el-icon>
            <template #title>{{ item.title }}</template>
        </el-menu-item>
    </template>
</template>

<style></style>
