import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { Toaster } from 'vue-sonner'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('Toaster', Toaster)

app.mount('#app')
