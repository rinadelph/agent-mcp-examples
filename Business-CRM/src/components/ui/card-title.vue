<script setup lang="ts">
import { cn } from '@/lib/utils'

interface CardTitleProps {
  class?: string
  as?: string
}

withDefaults(defineProps<CardTitleProps>(), {
  as: 'h3'
})
</script>

<template>
  <component
    :is="as"
    :class="cn('text-2xl font-semibold leading-none tracking-tight', $props.class)"
  >
    <slot />
  </component>
</template>