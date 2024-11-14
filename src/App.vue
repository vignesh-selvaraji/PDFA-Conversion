<template>
  <router-view />
</template>
<style>
body {
  cursor: default;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
} 
html{
    overflow: hidden !important;
}
</style>
<script setup lang="ts">
import { onMounted, ref } from "vue";
//
//  members
//
// const isNavigationDrawer = ref(true);
//
//  computed
//

//
//  lifecycle
//
onMounted(async () => {
  console.log("== App.vue : onMounted()");
});
//
//  methods
//

//
//
console.log("== App.vue");
</script>