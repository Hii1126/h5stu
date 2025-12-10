import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CartItem } from './cart' // 注意导入的是CartItem（含cartItemId）
import { useUserLoginStore } from './userLogin'
import { Decimal } from 'decimal.js'

// 订单商品类型（保留cartItemId，可追溯购物车记录）
export interface OrderItem extends Omit<CartItem, 'cartItemId'> {
  orderItemId: string // 订单商品唯一ID
}

// 订单类型
export interface Order {
  id: string // 订单ID
  userId: string // 用户ID
  items: OrderItem[] // 订单商品列表
  totalAmount: number // 订单总金额
  totalItems: number // 订单商品总数
  status: '未支付' | '已支付' | '退款成功' // 订单状态
  createTime: string // 订单创建时间
  payTime?: string // 支付时间
}

export const useOrderStore = defineStore('order', () => {
  // 获取用户登录Store
  const userStore = useUserLoginStore()
  
  // 订单列表
  const orders = ref<Order[]>([])

  // 生成订单商品唯一ID
  const generateOrderItemId = () => {
    return `ORDER-ITEM-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }

  // 创建订单
  function createOrder(items: CartItem[], totalAmount: number, totalItems: number) {
    const username = userStore.username
    if (!username) return null
    
    // 生成唯一订单ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
    
    // 转换购物车商品为订单商品（剔除cartItemId，生成orderItemId）
    const orderItems = items.map(item => ({
      ...item,
      orderItemId: generateOrderItemId(),
      cartItemId: undefined // 剔除购物车唯一标识
    }))
    
    // 强制保留2位小数，避免精度问题
    const preciseAmount = new Decimal(totalAmount).toFixed(2)
    
    // 创建订单
    const newOrder: Order = {
      id: orderId,
      userId: username,
      items: orderItems,
      totalAmount: Number(preciseAmount),
      totalItems,
      status: '未支付',
      createTime: new Date().toISOString()
    }
    
    // 添加到订单列表
    orders.value.unshift(newOrder)
    
    return newOrder
  }

  // 获取当前用户的订单
  function getCurrentUserOrders() {
    const username = userStore.username
    if (!username) return []
    
    return orders.value.filter(order => order.userId === username)
  }

  // 更新订单状态
  function updateOrderStatus(orderId: string, status: Order['status'], payTime?: string) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      if (payTime) {
        order.payTime = payTime
      }
    }
  }

  return {
    orders,
    createOrder,
    getCurrentUserOrders,
    updateOrderStatus
  }
}, {
  persist: {
    key: 'order',
    storage: localStorage
  }
})