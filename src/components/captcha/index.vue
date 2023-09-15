<script setup lang="ts">
import { $http } from '@/common/common';

const props = withDefaults(defineProps<{
    bg?: string,
}>(), {
    bg: '255,255,255'
});
const imgUrl = ref('captcha');
onMounted(() => {
    getCaptcha();
})
const emit = defineEmits(['change'])
const getCaptcha = () => {
    imgUrl.value = $http.getUrl(`/login/captcha?bg=${props.bg}&t=${Date.now()}`);
    emit('change')
}
</script>

<template>
    <img :src="imgUrl" title="点击切换验证码" @click="getCaptcha" class="pointer captcha-image">
</template>

<style scoped>
.captcha-image {
    width: 150px;
    height: 40px;
}
</style>
