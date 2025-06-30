import { loadStripe } from '@stripe/stripe-js'
import type { ApiResponse } from '../types/supabase'

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export interface PaymentIntentData {
  amount: number
  currency: string
  orderId: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentIntent?: any
  error?: string
}

export class StripeService {
  private stripe: any = null

  async initialize() {
    if (!this.stripe) {
      this.stripe = await stripePromise
      if (!this.stripe) {
        throw new Error('Failed to initialize Stripe')
      }
    }
    return this.stripe
  }

  async createPaymentIntent(data: PaymentIntentData): Promise<ApiResponse<any>> {
    try {
      // In a real application, this would be a backend API call
      // For now, we'll simulate the payment intent creation
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const paymentIntent = await response.json()
      return { success: true, data: paymentIntent }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create payment intent'
      return { success: false, error: message }
    }
  }

  async confirmCardPayment(clientSecret: string, paymentMethod: any): Promise<PaymentResult> {
    try {
      const stripe = await this.initialize()
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod
      })

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        }
      }

      return {
        success: true,
        paymentIntent: result.paymentIntent
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      }
    }
  }

  async createPaymentMethod(card: any, billingDetails: any): Promise<PaymentResult> {
    try {
      const stripe = await this.initialize()
      
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: billingDetails
      })

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        }
      }

      return {
        success: true,
        paymentIntent: result.paymentMethod
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment method'
      }
    }
  }

  async createElement(type: string, options?: any) {
    const stripe = await this.initialize()
    const elements = stripe.elements()
    return elements.create(type, options)
  }
}

export const stripeService = new StripeService()