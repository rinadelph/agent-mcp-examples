<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface CarouselProps {
  class?: string
  showIndicators?: boolean
  showNavigation?: boolean
  autoplay?: boolean
  autoplayInterval?: number
}

const props = withDefaults(defineProps<CarouselProps>(), {
  showIndicators: true,
  showNavigation: true,
  autoplay: false,
  autoplayInterval: 3000,
})

const currentIndex = ref(0)
const slides = ref<HTMLElement[]>([])

const slideCount = computed(() => slides.value.length)

const goToSlide = (index: number) => {
  currentIndex.value = index
}

const goToPrevious = () => {
  currentIndex.value = currentIndex.value === 0 ? slideCount.value - 1 : currentIndex.value - 1
}

const goToNext = () => {
  currentIndex.value = currentIndex.value === slideCount.value - 1 ? 0 : currentIndex.value + 1
}

// Auto-play functionality
if (props.autoplay) {
  setInterval(() => {
    goToNext()
  }, props.autoplayInterval)
}
</script>

<template>
  <div :class="cn('relative w-full', props.class)">
    <!-- Carousel Content -->
    <div class="relative overflow-hidden rounded-lg">
      <div
        class="flex transition-transform duration-300 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <slot />
      </div>
    </div>

    <!-- Navigation buttons -->
    <template v-if="showNavigation">
      <button
        @click="goToPrevious"
        class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg hover:bg-white"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
      <button
        @click="goToNext"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg hover:bg-white"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </template>

    <!-- Indicators -->
    <div v-if="showIndicators && slideCount > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
      <button
        v-for="(_, index) in slideCount"
        :key="index"
        @click="goToSlide(index)"
        :class="cn(
          'h-2 w-2 rounded-full transition-colors',
          index === currentIndex ? 'bg-white' : 'bg-white/50'
        )"
      />
    </div>
  </div>
</template>