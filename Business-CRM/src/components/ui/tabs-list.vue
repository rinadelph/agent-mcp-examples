<script setup lang="ts">
import { TabsList, type TabsListProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface TabsListCustomProps extends TabsListProps {
  class?: string
}

const props = defineProps<TabsListCustomProps>()
</script>

<template>
  <TabsList
    :class="cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      props.class
    )"
    v-bind="props"
  >
    <slot />
  </TabsList>
</template>