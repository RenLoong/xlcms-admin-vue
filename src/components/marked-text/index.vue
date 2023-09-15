<script lang="ts" setup>
import { marked } from 'marked';
// @ts-ignore
import { gfmHeadingId } from "marked-gfm-heading-id";
// @ts-ignore
import { mangle } from "marked-mangle";
import highlight from 'highlight.js';
import "highlight.js/styles/atom-one-dark.css";
const props = withDefaults(defineProps<{
    content?: string
}>(), {
});
const options = {
    prefix: "version-log-",
};

marked.use(gfmHeadingId(options));
marked.use(mangle());
const html = ref('');
const markedTextRef = ref<HTMLElement>();
watchEffect(() => {
    html.value = '';
    if (props.content) {
        html.value = props.content ? marked.parse(props.content) : '';
        nextTick(() => {
            const markedText = markedTextRef.value;
            if (markedText) {
                const codes = markedText.querySelectorAll('pre code');
                codes.forEach((code) => highlight.highlightElement(code as HTMLElement));
            }
        });
    }
})
</script>
<template>
    <div v-html="html" ref="markedTextRef" class="marked-text p-4"></div>
</template>
<style lang="scss">
.marked-text {
    img {
        width: 100%;
        max-width: 100%;
    }

    p {
        margin: 0;
    }
}
</style>