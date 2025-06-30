<template>
  <TransitionRoot :show="isOpen" as="template" @after-leave="searchQuery = ''">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="mx-auto max-w-xl transform rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
            <Combobox @update:modelValue="onSelect">
              <div class="relative">
                <SearchIcon class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                <ComboboxInput
                  class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search products..."
                  @input="searchQuery = $event.target.value"
                  @keydown.enter="handleSearch"
                />
              </div>

              <ComboboxOptions v-if="filteredProducts.length > 0" static class="max-h-80 scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2">
                <li v-for="product in filteredProducts" :key="product.id">
                  <h2 class="text-xs font-semibold text-gray-900 mb-2">Products</h2>
                  <ul class="-mx-4 mt-2 text-sm text-gray-700">
                    <ComboboxOption
                      v-for="product in filteredProducts"
                      :key="product.id"
                      :value="product"
                      as="template"
                      v-slot="{ active }"
                    >
                      <li :class="['flex cursor-default select-none items-center px-4 py-2', active && 'bg-blue-600 text-white']">
                        <img 
                          v-if="product.image_url" 
                          :src="product.image_url" 
                          :alt="product.name"
                          class="h-10 w-10 flex-none rounded-lg object-cover"
                        />
                        <div v-else class="h-10 w-10 flex-none rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <div class="ml-4 flex-auto">
                          <p :class="['text-sm font-medium', active ? 'text-white' : 'text-gray-900']">
                            {{ product.name }}
                          </p>
                          <p :class="['text-sm', active ? 'text-blue-200' : 'text-gray-500']">
                            ${{ product.price.toFixed(2) }}
                          </p>
                        </div>
                      </li>
                    </ComboboxOption>
                  </ul>
                </li>
              </ComboboxOptions>

              <div v-if="searchQuery !== '' && filteredProducts.length === 0" class="px-6 py-14 text-center text-sm sm:px-14">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="mt-4 font-semibold text-gray-900">No results found</p>
                <p class="mt-2 text-gray-500">We couldn't find anything with that term. Please try again.</p>
              </div>

              <div class="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
                Press 
                <kbd class="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2">↵</kbd>
                to search all products or
                <kbd class="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2">↑</kbd>
                <kbd class="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2">↓</kbd>
                to navigate.
              </div>
            </Combobox>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/vue'
import { Search as SearchIcon } from 'lucide-vue-next'
import { useProductsStore } from '@/stores/products'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const productsStore = useProductsStore()
const searchQuery = ref('')

const filteredProducts = computed(() => {
  if (!searchQuery.value) return []
  
  const query = searchQuery.value.toLowerCase()
  return productsStore.products
    .filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
    .slice(0, 5) // Show max 5 results
})

function close() {
  emit('close')
}

function onSelect(product: any) {
  if (product) {
    router.push(`/products/${product.id}`)
    close()
  }
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/shop',
      query: { search: searchQuery.value.trim() }
    })
    close()
  }
}
</script>