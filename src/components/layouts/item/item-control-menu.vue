<script lang="ts" setup>
import { useMenuStore, useRefs } from '@/stores';

withDefaults(defineProps<{
    count: number,
    dev_issues: number,
    issues: number
}>(), {
    count: 0,
    dev_issues: 0,
    issues: 0
});
const { MENU } = useRefs(useMenuStore());
</script>
<template>
    <el-menu router>
        <xlcms-el-menu-item :auth="MENU" />
    </el-menu>
</template>
<style lang="scss">
.el-badge.message-count .el-badge__content {
    top: calc(var(--el-menu-sub-item-height) / 3);
    right: -5px;
}
</style>