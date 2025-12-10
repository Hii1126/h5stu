import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserLoginStore } from './userLogin'
import { Decimal } from 'decimal.js'

// 手机类型定义
export interface Phone {
  id: number
  phoneName: string
  remark: string
  price: number
  originalPrice: number | null
  img_url: string
}

// 购物车商品类型（新增唯一标识 cartItemId）
export interface CartItem extends Phone {
  cartItemId: string // 购物车记录唯一ID
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // 获取用户登录Store
  const userStore = useUserLoginStore()
  
  // 购物车数据结构：{ 用户名: 购物车商品数组 }
  const allCartItems = ref<Record<string, CartItem[]>>({})

  // 生成购物车记录唯一ID
  const generateCartItemId = () => {
    return `CART-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }

  // 获取当前用户的购物车商品
  const cartItems = computed(() => {
    const username = userStore.username
    // 如果用户名不存在，返回空数组
    if (!username) return []
    // 如果该用户没有购物车数据，初始化一个空数组
    if (!allCartItems.value[username]) {
      allCartItems.value[username] = []
    }
    return allCartItems.value[username]
  })

  // 添加商品到当前用户的购物车（不再合并，直接新增记录）
  function addToCart(phone: Phone) {
    const username = userStore.username
    if (!username) return
    
    // 确保当前用户有购物车数据
    if (!allCartItems.value[username]) {
      allCartItems.value[username] = []
    }
    
    const userCart = allCartItems.value[username]
    // 新增记录，生成唯一cartItemId，数量默认1
    userCart.unshift({
      ...phone,
      cartItemId: generateCartItemId(),
      quantity: 1
    })
  }

  // 从当前用户的购物车移除商品（根据cartItemId）
  function removeFromCart(cartItemId: string) {
    const username = userStore.username
    if (!username || !allCartItems.value[username]) return
    
    allCartItems.value[username] = allCartItems.value[username].filter(
      item => item.cartItemId !== cartItemId
    )
  }

  // 更新当前用户购物车中商品的数量（根据cartItemId）
  function updateQuantity(cartItemId: string, quantity: number) {
    const username = userStore.username
    if (!username || !allCartItems.value[username]) return
    
    const item = allCartItems.value[username].find(
      item => item.cartItemId === cartItemId
    )
    if (item) {
      item.quantity = Math.max(1, Math.floor(quantity)) // 确保数量≥1且为整数
    }
  }

  // 清空当前用户的购物车
  function clearCart() {
    const username = userStore.username
    if (!username) return
    
    allCartItems.value[username] = []
  }

  // 计算当前用户购物车商品总数
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 计算当前用户购物车总金额
  const totalAmount = computed(() => {
    return cartItems.value.reduce((total, item) => {
      const itemTotal = new Decimal(item.price).mul(new Decimal(item.quantity))
      return new Decimal(total).add(itemTotal).toNumber()
    }, 0)
  })

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount
  }
}, {
  persist: {
    key: 'cart',
    storage: localStorage
  }
})