<template>
  <div class="cart-container">
    <h2>我的购物车</h2>
    
    <!-- 购物车为空提示 -->
    <div v-if="cartStore.cartItems.length === 0" class="empty-cart">
      <p>购物车空空如也，快去添加商品吧～</p>
    </div>

    <!-- 购物车表格 -->
    <div v-else class="cart-table-wrap">
      <!-- 已选商品统计 -->
      <div class="cart-summary">
        <p>
          已选 <span class="selected-count">{{ selectedItems.length }}</span> 件商品，
          合计金额：<span class="total-price">{{ formatPriceDisplay(selectedTotalAmount) }}</span>
        </p>
      </div>

      <!-- 购物车表格 -->
      <el-table
        :data="cartStore.cartItems"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        ref="cartTableRef"
        :row-key="(row) => row.cartItemId" 
      >
        <!-- 选择列 -->
        <el-table-column type="selection" width="55" />
        
        <!-- 商品图片列 -->
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image
              :src="getImageUrl(scope.row.id)"
              fit="cover"
              class="item-img"
              style="width: 80px; height: 80px"
            />
          </template>
        </el-table-column>
        
        <!-- 商品名称列 -->
        <el-table-column prop="phoneName" label="商品名称" min-width="200" />
        
        <!-- 商品描述列 -->
        <el-table-column prop="remark" label="商品描述" min-width="300" />
        
        <!-- 单价列 -->
        <el-table-column label="单价" width="120">
          <template #default="scope">
            <span class="current-price">{{ formatPriceDisplay(scope.row.price) }}</span>
            <span v-if="scope.row.originalPrice" class="original-price">{{ formatPriceDisplay(scope.row.originalPrice) }}</span>
          </template>
        </el-table-column>
        
        <!-- 数量列 -->
        <el-table-column label="数量" width="180">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.quantity"
              :min="1"
              @change="() => updateQuantity(scope.row.cartItemId, scope.row.quantity)"
              size="small"
            />
          </template>
        </el-table-column>
        
        <!-- 小计列 -->
        <el-table-column label="小计" width="120">
          <template #default="scope">
            <span class="subtotal">{{ multiplyPrice(scope.row.price, scope.row.quantity) }}</span>
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="removeFromCart(scope.row.cartItemId)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部操作区 -->
      <div class="cart-actions">
        <el-button
          type="default"
          size="large"
          icon="el-icon-delete"
          @click="batchDelete"
          :disabled="selectedItems.length === 0"
        >
          批量删除
        </el-button>
        <div class="pay-btn-wrap">
          <el-button
            type="primary"
            size="large"
            icon="el-icon-shopping-cart-full"
            @click="goToPay"
            :disabled="selectedItems.length === 0"
          >
            去支付
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElTable } from 'element-plus'
import type { TableInstance } from 'element-plus'
// 引入 decimal.js 工具函数
import { multiplyPrice, sumPrices, formatPriceDisplay } from '@/utils/price'
import { Decimal } from 'decimal.js'
import type { CartItem } from '@/stores/cart'

// Store 实例
const cartStore = useCartStore()
const orderStore = useOrderStore()
const router = useRouter()

// 表格Ref
const cartTableRef = ref<TableInstance>()

// 已选商品
const selectedItems = ref<CartItem[]>([])

// 处理选择事件
const handleSelectionChange = (val: CartItem[]) => {
  selectedItems.value = val
}

// 计算已选商品总金额（使用 decimal.js 保证精度）
const selectedTotalAmount = computed(() => {
  // 先计算每个选中商品的小计，再求和
  const subtotals = selectedItems.value.map(item => {
    return new Decimal(item.price).mul(new Decimal(item.quantity)).toNumber()
  })
  return sumPrices(subtotals)
})

// 计算已选商品总数
const selectedTotalItems = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + item.quantity
  }, 0)
})

// 获取商品图片URL
const getImageUrl = (id: number) => {
  return new URL(`/src/assets/imgs/${id}.webp`, import.meta.url).href
}

// 更新商品数量（传入cartItemId）
const updateQuantity = (cartItemId: string, quantity: number) => {
  cartStore.updateQuantity(cartItemId, quantity)
}

// 移除单个商品（传入cartItemId）
const removeFromCart = (cartItemId: string) => {
  cartStore.removeFromCart(cartItemId)
  ElMessage.success('商品已从购物车移除')
}

// 批量删除
const batchDelete = () => {
  const cartItemIds = selectedItems.value.map(item => item.cartItemId)
  cartItemIds.forEach(id => cartStore.removeFromCart(id))
  // 清空选择
  cartTableRef.value?.clearSelection()
  ElMessage.success('已批量删除选中商品')
}

// 去支付
const goToPay = () => {
  // 创建订单（使用 decimal.js 确保金额精度）
  const totalAmount = new Decimal(selectedTotalAmount.value).toNumber()
  const order = orderStore.createOrder(
    selectedItems.value,
    totalAmount,
    selectedTotalItems.value
  )
  
  if (order) {
    // 删除已支付的商品
    selectedItems.value.forEach(item => cartStore.removeFromCart(item.cartItemId))
    // 清空选择
    cartTableRef.value?.clearSelection()
    ElMessage.success('订单创建成功，前往支付')
    router.push('/orders')
  } else {
    ElMessage.error('创建订单失败，请重试')
  }
}
</script>

<style scoped>
/* 样式保持不变 */
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 80px 0;
  color: #909399;
  font-size: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.cart-table-wrap {
  margin-top: 20px;
}

.cart-summary {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
  text-align: right;
}

.selected-count {
  color: #f56c6c;
  font-weight: bold;
  margin: 0 4px;
}

.total-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-left: 4px;
}

.item-img {
  border-radius: 4px;
}

.current-price {
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  color: #909399;
  font-size: 12px;
  text-decoration: line-through;
  margin-left: 8px;
}

.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.pay-btn-wrap {
  display: flex;
  gap: 10px;
}
</style>