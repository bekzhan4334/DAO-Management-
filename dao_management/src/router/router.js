import { createRouter, createWebHistory } from 'vue-router'
import Main from '@/pages/Main'
import TransactionPage from '@/pages/TransactionPage'
import components from '@/components'

const routes = [
    {
        path: "/",
        component: Main
    },
    // {
    //     path: "/transaction/:transactionHash",
    //     component: TransactionPage
    // }

]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router