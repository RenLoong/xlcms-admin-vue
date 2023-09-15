<script lang="ts" setup>
import { $http } from "@/common/common";
import { onWindowResize } from "@/common/functions";
import { ElMessage } from 'element-plus'
const props = withDefaults(defineProps<{
    group?: string
}>(), {
    group: 'basic'
});
const tabPosition = ref<'top' | 'right' | 'bottom' | 'left'>('left');
if (window.innerWidth < 1450) {
    tabPosition.value = 'top';
} else {
    tabPosition.value = 'left';
}
const activeName = ref(props.group ?? 'basic');
onWindowResize(() => {
    if (window.innerWidth < 1450) {
        tabPosition.value = 'top';
    } else {
        tabPosition.value = 'left';
    }
})
const configData = ref<any[]>([])
const loadingState = ref(false);
const getSetting = () => {
    loadingState.value = true;
    return $http.get('setting/' + props.group).then((ret: any) => {
        if (ret.code === $http.ResponseCode.SUCCESS) {
            configData.value = ret.data;
        }
    }).finally(() => {
        nextTick(() => {
            loadingState.value = false;
        })
    })
}
const changeValue = (val: any, name: string, item: any) => {
    if (loadingState.value) return;
    $http.post('setting/basic/Edit', {
        gruop: name,
        key: item.name,
        value: val
    }).then((ret: any) => {
        if (ret.code !== $http.ResponseCode.SUCCESS) {
            ElMessage.error(ret.message);
        }
    })
}
onMounted(() => {
    getSetting();
})
</script>
<template>
    <el-form class="bg-white rounded-4 flex-1 flex overflow-hidden flex-column p-6" size="large" label-position="top"
        v-loading="loadingState">
        <el-tabs v-model="activeName" :tab-position="tabPosition" class="flex-1 setting-tabs overflow-hidden">
            <el-tab-pane :name="configGroup.name" :label="configGroup.label" v-for="configGroup in configData">
                <div class="p-6 form-body">
                    <el-form-item :label="item.label" v-for="item in configGroup.children"
                        class="border-bottom border-bottom-dashed p-4 hover-bg-hover rounded-4">
                        <component :is="item.component" v-model="item.value" :placeholder="item.placeholder"
                            v-bind="item.props ?? {}" @change="changeValue($event, configGroup.name, item)">
                            <template v-if="item.children">
                                <component v-for="child in item.children" :is="item.children_component"
                                    v-bind="child.props ?? {}" :key="child.value" :value="child.value"
                                    :label="['el-select'].includes(item.component) ? child.title : child.value">
                                    {{ child.title }}
                                </component>
                            </template>
                        </component>
                        <div class="line-height-2 pt-2 text-grey h10 w-100 text-tips">{{ item.tips }}</div>
                    </el-form-item>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-form>
</template>
<style lang="scss">
.setting-tabs {
    --layouts-width: 950px;
    display: flex;

    &.el-tabs--top {
        flex-direction: column;
    }

    .el-tabs__header.is-left {
        .el-tabs__item {
            min-width: 200px;
            --el-tabs-header-height: 60px;
        }
    }

    .el-tabs__header.is-top {
        .el-tabs__item {
            min-width: 80px;
            --el-tabs-header-height: 60px;
        }
    }

    .el-tabs__header {
        .el-tabs__item {
            font-size: 16px;
            font-weight: 600;
        }
    }

    .el-tabs__content {
        height: 100%;
        overflow: auto;
        flex: 1;
    }

    .text-tips {
        white-space: pre-wrap;
    }

    .el-form-item__label {
        font-weight: 600;
    }

    .form-body {
        max-width: var(--layouts-width);
    }
}
</style>
