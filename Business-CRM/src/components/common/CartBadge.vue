<template>
  <div class="relative inline-flex">
    <slot />
    <span
      v-if="count > 0"
      class="absolute -top-2 -right-2 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
    >
      {{ displayCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  count: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  max: 99
})

const displayCount = computed(() => {
  return props.count > props.max ? `${props.max}+` : props.count.toString()
})
</script>