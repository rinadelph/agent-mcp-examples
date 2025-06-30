<template>
  <div class="space-y-6">
    <!-- Settings Navigation -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8">
        <button
          v-for="tab in settingsTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
          :class="activeTab === tab.id 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- General Settings -->
    <div v-if="activeTab === 'general'">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic store configuration and information</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">Store Name</label>
              <Input v-model="generalSettings.storeName" placeholder="925 Silver" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Store URL</label>
              <Input v-model="generalSettings.storeUrl" placeholder="https://925silver.com" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Contact Email</label>
              <Input v-model="generalSettings.contactEmail" type="email" placeholder="support@925silver.com" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Support Phone</label>
              <Input v-model="generalSettings.supportPhone" placeholder="+1 (555) 123-4567" />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Store Description</label>
            <textarea
              v-model="generalSettings.storeDescription"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows="4"
              placeholder="Premium sterling silver jewelry store..."
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">Currency</label>
              <select v-model="generalSettings.currency" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Timezone</label>
              <select v-model="generalSettings.timezone" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end">
            <Button @click="saveGeneralSettings">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Shipping Settings -->
    <div v-if="activeTab === 'shipping'">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Configuration</CardTitle>
          <CardDescription>Manage shipping rates and policies</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">Free Shipping Threshold</label>
              <Input v-model.number="shippingSettings.freeShippingThreshold" type="number" placeholder="50.00" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Standard Shipping Rate</label>
              <Input v-model.number="shippingSettings.standardRate" type="number" placeholder="10.00" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Express Shipping Rate</label>
              <Input v-model.number="shippingSettings.expressRate" type="number" placeholder="25.00" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Processing Time (days)</label>
              <Input v-model.number="shippingSettings.processingTime" type="number" placeholder="2" />
            </div>
          </div>

          <div class="space-y-3">
            <label class="text-sm font-medium">Shipping Zones</label>
            <div class="space-y-2">
              <div v-for="zone in shippingSettings.zones" :key="zone.id" class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p class="font-medium">{{ zone.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ zone.countries.join(', ') }}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium">${{ zone.rate.toFixed(2) }}</p>
                  <Button variant="ghost" size="sm" @click="editShippingZone(zone)">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="outline" @click="addShippingZone">Add Shipping Zone</Button>
          </div>

          <div class="flex justify-end">
            <Button @click="saveShippingSettings">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Payment Settings -->
    <div v-if="activeTab === 'payment'">
      <Card>
        <CardHeader>
          <CardTitle>Payment Configuration</CardTitle>
          <CardDescription>Configure payment methods and settings</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span class="text-white text-xs font-bold">CARD</span>
                </div>
                <div>
                  <p class="font-medium">Credit/Debit Cards</p>
                  <p class="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-green-600">Active</span>
                <input type="checkbox" v-model="paymentSettings.creditCards" class="rounded" />
              </div>
            </div>

            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <span class="text-white text-xs font-bold">PP</span>
                </div>
                <div>
                  <p class="font-medium">PayPal</p>
                  <p class="text-sm text-muted-foreground">PayPal payments and PayPal Credit</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Inactive</span>
                <input type="checkbox" v-model="paymentSettings.paypal" class="rounded" />
              </div>
            </div>

            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-6 bg-purple-600 rounded flex items-center justify-center">
                  <span class="text-white text-xs font-bold">$</span>
                </div>
                <div>
                  <p class="font-medium">Bank Transfer</p>
                  <p class="text-sm text-muted-foreground">Direct bank transfers</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Inactive</span>
                <input type="checkbox" v-model="paymentSettings.bankTransfer" class="rounded" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div class="space-y-2">
              <label class="text-sm font-medium">Payment Provider</label>
              <select v-model="paymentSettings.provider" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Test Mode</label>
              <div class="flex items-center space-x-2">
                <input type="checkbox" v-model="paymentSettings.testMode" class="rounded" />
                <span class="text-sm">Enable test mode</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button @click="savePaymentSettings">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Email Settings -->
    <div v-if="activeTab === 'email'">
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Configure email notifications and templates</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">SMTP Host</label>
              <Input v-model="emailSettings.smtpHost" placeholder="smtp.gmail.com" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">SMTP Port</label>
              <Input v-model.number="emailSettings.smtpPort" type="number" placeholder="587" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Username</label>
              <Input v-model="emailSettings.username" placeholder="noreply@925silver.com" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">From Name</label>
              <Input v-model="emailSettings.fromName" placeholder="925 Silver" />
            </div>
          </div>

          <div class="space-y-3">
            <label class="text-sm font-medium">Email Notifications</label>
            <div class="space-y-2">
              <div v-for="notification in emailSettings.notifications" :key="notification.type" class="flex items-center justify-between p-3 border rounded">
                <div>
                  <p class="font-medium">{{ notification.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ notification.description }}</p>
                </div>
                <input type="checkbox" v-model="notification.enabled" class="rounded" />
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button @click="saveEmailSettings">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Security Settings -->
    <div v-if="activeTab === 'security'">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Configure security policies and access controls</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium">Session Timeout (minutes)</label>
              <Input v-model.number="securitySettings.sessionTimeout" type="number" placeholder="60" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Max Login Attempts</label>
              <Input v-model.number="securitySettings.maxLoginAttempts" type="number" placeholder="5" />
            </div>
          </div>

          <div class="space-y-3">
            <label class="text-sm font-medium">Security Features</label>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Two-Factor Authentication</p>
                  <p class="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <input type="checkbox" v-model="securitySettings.require2FA" class="rounded" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">IP Whitelist</p>
                  <p class="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
                </div>
                <input type="checkbox" v-model="securitySettings.ipWhitelist" class="rounded" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">SSL Enforcement</p>
                  <p class="text-sm text-muted-foreground">Force HTTPS for all connections</p>
                </div>
                <input type="checkbox" v-model="securitySettings.forceSSL" class="rounded" />
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button @click="saveSecuritySettings">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button,
  Input
} from '@/components/ui'
import { toast } from 'vue-sonner'

const activeTab = ref('general')

const settingsTabs = ref([
  { id: 'general', name: 'General' },
  { id: 'shipping', name: 'Shipping' },
  { id: 'payment', name: 'Payment' },
  { id: 'email', name: 'Email' },
  { id: 'security', name: 'Security' }
])

const generalSettings = ref({
  storeName: '925 Silver',
  storeUrl: 'https://925silver.com',
  contactEmail: 'support@925silver.com',
  supportPhone: '+1 (555) 123-4567',
  storeDescription: 'Premium sterling silver jewelry store offering handcrafted pieces designed to last a lifetime.',
  currency: 'USD',
  timezone: 'America/New_York'
})

const shippingSettings = ref({
  freeShippingThreshold: 50.00,
  standardRate: 10.00,
  expressRate: 25.00,
  processingTime: 2,
  zones: [
    { id: 1, name: 'Domestic', countries: ['United States'], rate: 10.00 },
    { id: 2, name: 'Canada', countries: ['Canada'], rate: 15.00 },
    { id: 3, name: 'International', countries: ['All Others'], rate: 25.00 }
  ]
})

const paymentSettings = ref({
  creditCards: true,
  paypal: false,
  bankTransfer: false,
  provider: 'stripe',
  testMode: true
})

const emailSettings = ref({
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  username: 'noreply@925silver.com',
  fromName: '925 Silver',
  notifications: [
    { type: 'order_confirmation', name: 'Order Confirmation', description: 'Send when order is placed', enabled: true },
    { type: 'order_shipped', name: 'Order Shipped', description: 'Send when order is shipped', enabled: true },
    { type: 'order_delivered', name: 'Order Delivered', description: 'Send when order is delivered', enabled: false },
    { type: 'password_reset', name: 'Password Reset', description: 'Send password reset emails', enabled: true },
    { type: 'low_stock', name: 'Low Stock Alert', description: 'Alert when products are low in stock', enabled: true }
  ]
})

const securitySettings = ref({
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  require2FA: false,
  ipWhitelist: false,
  forceSSL: true
})

function saveGeneralSettings() {
  toast.success('General settings saved successfully')
}

function saveShippingSettings() {
  toast.success('Shipping settings saved successfully')
}

function savePaymentSettings() {
  toast.success('Payment settings saved successfully')
}

function saveEmailSettings() {
  toast.success('Email settings saved successfully')
}

function saveSecuritySettings() {
  toast.success('Security settings saved successfully')
}

function editShippingZone(zone: any) {
  toast.info(`Edit shipping zone: ${zone.name}`)
}

function addShippingZone() {
  toast.info('Add shipping zone functionality coming soon')
}
</script>