import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '../types/supabase'
import { 
  fetchProducts as apiGetProducts, 
  fetchProductById as apiGetProductById,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct
} from '../services/api'
import { toast } from 'vue-sonner'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const featuredProducts = ref<Product[]>([])
  const loading = ref(false)

  // Actions
  async function fetchProducts() {
    loading.value = true
    try {
      const response = await apiGetProducts()
      if (response.success) {
        products.value = response.data
        // Update featured products
        featuredProducts.value = response.data.filter(p => p.is_featured)
      } else {
        toast.error(response.error || 'Failed to fetch products')
        products.value = []
        featuredProducts.value = []
      }
    } catch (error) {
      toast.error('Failed to fetch products')
      products.value = []
      featuredProducts.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id: string) {
    loading.value = true
    try {
      const response = await apiGetProductById(id)
      if (response.success) {
        currentProduct.value = response.data
      } else {
        toast.error(response.error || 'Failed to fetch product')
        currentProduct.value = null
      }
    } catch (error) {
      toast.error('Failed to fetch product')
      currentProduct.value = null
    } finally {
      loading.value = false
    }
  }

  function filterProducts(searchTerm: string, category?: string) {
    let filtered = products.value

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      )
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }

    return filtered
  }

  function sortProducts(productsList: Product[], sortBy: 'price-asc' | 'price-desc' | 'name' | 'newest') {
    const sorted = [...productsList]
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      default:
        return sorted
    }
  }

  async function createProduct(productData: any) {
    loading.value = true
    try {
      const response = await apiCreateProduct(productData)
      if (response.success) {
        // Add new product to the local state
        products.value.unshift(response.data)
        // Update featured products if needed
        if (response.data.is_featured) {
          featuredProducts.value.unshift(response.data)
        }
        return response
      } else {
        toast.error(response.error || 'Failed to create product')
        throw new Error(response.error)
      }
    } catch (error) {
      toast.error('Failed to create product')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id: string, productData: any) {
    loading.value = true
    try {
      const response = await apiUpdateProduct(id, productData)
      if (response.success) {
        // Update product in local state
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = response.data
        }
        
        // Update featured products
        featuredProducts.value = products.value.filter(p => p.is_featured)
        
        // Update current product if it's the same
        if (currentProduct.value?.id === id) {
          currentProduct.value = response.data
        }
        
        return response
      } else {
        toast.error(response.error || 'Failed to update product')
        throw new Error(response.error)
      }
    } catch (error) {
      toast.error('Failed to update product')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id: string) {
    loading.value = true
    try {
      const response = await apiDeleteProduct(id)
      if (response.success) {
        // Remove product from local state
        products.value = products.value.filter(p => p.id !== id)
        featuredProducts.value = featuredProducts.value.filter(p => p.id !== id)
        
        // Clear current product if it's the same
        if (currentProduct.value?.id === id) {
          currentProduct.value = null
        }
        
        return response
      } else {
        toast.error(response.error || 'Failed to delete product')
        throw new Error(response.error)
      }
    } catch (error) {
      toast.error('Failed to delete product')
      throw error
    } finally {
      loading.value = false
    }
  }

  // Getters
  const productsByCategory = computed(() => {
    const categoryMap = new Map<string, Product[]>()
    
    products.value.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, [])
      }
      categoryMap.get(product.category)!.push(product)
    })
    
    return categoryMap
  })

  const categories = computed(() => {
    return Array.from(new Set(products.value.map(p => p.category)))
  })

  return {
    // State
    products,
    currentProduct,
    featuredProducts,
    loading,
    
    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    filterProducts,
    sortProducts,
    
    // Getters
    productsByCategory,
    categories
  }
})