<script setup lang="ts">
import { TabsContent, type TabsContentProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface TabsContentCustomProps extends TabsContentProps {
  class?: string
}

const props = defineProps<TabsContentCustomProps>()
</script>

<template>
  <TabsContent
    :class="cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      props.class
    )"
    v-bind="props"
  >
    <slot />
  </TabsContent>
</template>