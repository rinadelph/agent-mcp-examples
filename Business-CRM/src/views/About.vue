<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">About 925 Silver</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted source for authentic 925 sterling silver jewelry since 2010
        </p>
      </div>

      <!-- Story Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80" 
            alt="Silver jewelry crafting"
            class="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div class="flex flex-col justify-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p class="text-gray-600 mb-4">
            Founded with a passion for fine jewelry and craftsmanship, 925 Silver has been 
            serving customers with authentic sterling silver pieces for over a decade. Our 
            commitment to quality and customer satisfaction has made us a trusted name in 
            the jewelry industry.
          </p>
          <p class="text-gray-600 mb-4">
            We believe that everyone deserves to own beautiful, high-quality jewelry without 
            breaking the bank. That's why we work directly with skilled artisans to bring you 
            the finest 925 sterling silver pieces at competitive prices.
          </p>
          <p class="text-gray-600">
            Every piece in our collection is carefully selected and quality-checked to ensure 
            it meets our high standards. When you shop with us, you're not just buying jewelry 
            – you're investing in pieces that will last a lifetime.
          </p>
        </div>
      </div>

      <!-- Values Section -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-16">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Our Values</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Quality Assured</h3>
            <p class="text-gray-600">
              All our jewelry is genuine 925 sterling silver, tested and certified for authenticity.
            </p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Customer First</h3>
            <p class="text-gray-600">
              Your satisfaction is our priority. We offer hassle-free returns and dedicated support.
            </p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Fair Pricing</h3>
            <p class="text-gray-600">
              Direct sourcing means better prices for you without compromising on quality.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="text-center bg-gray-900 text-white rounded-lg p-12">
        <h2 class="text-3xl font-bold mb-4">Ready to Find Your Perfect Piece?</h2>
        <p class="text-xl mb-8 opacity-90">
          Browse our collection of authentic 925 sterling silver jewelry
        </p>
        <Button @click="$router.push('/shop')" size="lg" variant="secondary">
          Shop Now
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui'
</script>