<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CarouselItemProps {
  class?: string
}

const props = defineProps<CarouselItemProps>()
</script>

<template>
  <div :class="cn('min-w-full', props.class)">
    <slot />
  </div>
</template>