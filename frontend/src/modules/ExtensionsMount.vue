<template>
  <component
    v-for="(Comp, idx) in components"
    :is="Comp"
    :key="idx"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { list } from "@/modules/registry";
const props = defineProps<{ target: string }>();
const components = computed(() => list(props.target));
</script>
