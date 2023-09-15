<script setup lang="ts">
import { useUserStore } from "@/stores";
const { hasLogin, initUserInfo, userListener } = useUserStore()
import { getUserInfo,useInit } from "@/common/functions/request";
onBeforeMount(() => {
  initUserInfo();
  userListener();
  useInit(()=>{
    if (hasLogin()) {
      getUserInfo();
    }
  });
})
</script>

<template>
  <router-view/>
</template>

<style lang="scss"></style>