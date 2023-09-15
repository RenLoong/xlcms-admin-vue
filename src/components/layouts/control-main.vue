<script lang="ts" setup>
defineProps<{
    class?: string,
    loading?: boolean,
}>();
</script>
<template>
    <slot name="header"></slot>
    <main class="flex-1 overflow-auto" :class="class" v-loading="!!loading">
        <slot></slot>
    </main>
    <slot name="footer"></slot>
</template>