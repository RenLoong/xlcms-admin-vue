<script lang="ts" setup>
import { ref } from "vue";
const props = withDefaults(defineProps<{
    type: string
    list: any
    width: number | string
    height: number | string
}>(), {
    type: '',
    list: [],
    width: '100%',
    height: '16vh'
});
const adsImage = ref<HTMLElement[]>([]);
const emit = defineEmits(['inited']);
onMounted(() => {
    let imgTop = [];
    for (let i = 0; i < adsImage.value.length; i++) {
        const element = adsImage.value[i];
        imgTop.push(element.offsetTop);
    }
    if (imgTop.length) {
        emit('inited', imgTop);
    }
})
</script>

<template>
    <template v-if="props.type === 'FULL-SCREEN'">
        <div class="full-screen-ads" v-for="item in props.list">
            <img :src="item.img" ref="adsImage">
        </div>
    </template>
    <template v-else-if="props.type === 'FULL-SCREEN-SWIPER'">
        <div class="full-screen-ads swiper">
            <div class="swiper-item" v-for="item in props.list">
                <img :src="item.img" ref="adsImage">
            </div>
        </div>
    </template>
    <template v-else-if="props.type === 'HALF-SCREEN'">
        <div class="half-screen-ads" v-for="item in props.list">
            <img :src="item.img" ref="adsImage">
        </div>
    </template>
    <template v-else-if="props.type === 'HALF-SCREEN-SWIPER'">
        <div class="half-screen-ads swiper">
            <div class="swiper-item" v-for="item in props.list">
                <img :src="item.img" ref="adsImage">
            </div>
        </div>
    </template>
    <template v-else-if="props.type === 'SWIPER'">
        <div class="swiper" :style="{ width: width, height: height }">
            <div class="swiper-item" v-for="item in props.list">
                <img :src="item.img" ref="adsImage">
            </div>
        </div>
    </template>
    <template v-else-if="props.type === 'ROWS'">
        <div class="flex flex-wrap img-100">
            <div v-for="item in props.list" :style="{ width: item.w, height: item.h }">
                <img :src="item.img" ref="adsImage">
            </div>
        </div>
    </template>
    <template v-else>
        <div class="img-100" v-for="item in props.list" :style="{ width: item.w, height: item.h }">
            <img :src="item.img" ref="adsImage">
        </div>
    </template>
</template>

<style lang="scss" scoped>
.full-screen-ads {
    height: calc(80vh - 87px);
    width: 100%;
}

.full-screen-ads img {
    height: calc(80vh - 87px);
    width: 100%;
}

.half-screen-ads {
    height: calc(40vh - 87px);
    width: 100%;
}

.half-screen-ads img {
    height: calc(40vh - 87px);
    width: 100%;
}

.swiper {
    overflow-x: scroll;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    display: flex;
    scrollbar-width: none;
}

.swiper::-webkit-scrollbar {
    width: 0px !important;
}

.swiper .swiper-item {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    scroll-snap-align: start;
    scroll-snap-stop: always;
}

.swiper .swiper-item img {
    max-height: 100%;
    width: 100%;
}

.img-100 {
    max-width: 100%;
}

.img-100 img {
    height: 100%;
    width: 100%;
    max-width: 100%;
}
</style>
