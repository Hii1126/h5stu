import { createRouter, createWebHistory } from 'vue-router'
import registerView from '@/views/user/registerView.vue'
import loginView from '@/views/user/loginView.vue'
import IndexView from '@/views/IndexView.vue'
import { ElMessage } from 'element-plus'
import { ElNotification } from 'element-plus'
import OrdersView from '@/views/goods/ordersView.vue'
import CartView from '@/views/goods/cartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
    path:'/',
    component:IndexView
    },
    {
    path:'/register',
    component:registerView
    },
    {
    path:'/login',
    component:loginView
    },
    {
    path:'/orders',
    component:OrdersView,
    meta: { auth: true }
    },
    {
    path:'/cart',
    component:CartView,
    meta: { auth: true }
    }
   
  ],
})
import { storeToRefs } from 'pinia'
import {useUserLoginStore} from '@/stores/userLogin'
// 全局路由守卫
  
 router.beforeEach((to, from) => {
  const loginStore = useUserLoginStore()
  const {username} = storeToRefs(loginStore)
  if(to.meta.auth &&!username.value){
    //通知框
      ElNotification({
        title: '错误',    
        message:'sorry,请先登录',
        type: 'error',
        duration:1000
      })
    return '/login'
  }
  return true;
})
export default router
