import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/router'
import store from '@/store'
import components from '@/components'

// import PrimeVue from 'primevue/config';
// import Aura from '@primevue/themes/aura';

const app = createApp(App)

components.forEach(component => {
    app.component(component.name, component)
})

app
.use(router)
.use(store)
.mount('#app')




// .use(PrimeVue, {
//     theme: {
//         preset: Aura
//     }
// })
