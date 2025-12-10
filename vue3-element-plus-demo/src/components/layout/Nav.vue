<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <el-menu-item index="0">
      <img
        style="width: 100px"
        src="@/assets/imgs/element-plus-logo.svg"
        alt="Element logo"
      />
    </el-menu-item>
    <el-menu-item index="search">
      <el-input
        v-model="input2"
        style="width: 240px"
        placeholder="请输入商品名称"
        :suffix-icon="Search"
        @keyup.enter="handleSearch"
      />
    </el-menu-item>
    <el-menu-item index="1" @click="router.push('/')">首页</el-menu-item>
    <!-- 登录状态下不显示登录按钮 -->
    <el-menu-item v-if="!userStore.username" index="2" @click="router.push('/login')">登录</el-menu-item>
    <el-menu-item v-if="!userStore.username" index="3" @click="router.push('/register')">注册</el-menu-item>
    <el-menu-item index="4" @click="router.push('/orders')">我的订单</el-menu-item>
    <el-menu-item index="5" class="cart-menu-item">
      <el-popover
        placement="bottom-end"
        trigger="hover"
        width="360"
        popper-class="cart-popover"
        :show-arrow="false"
      >
        <!-- 弹窗内容：购物车预览 + 数量超限提示 -->
        <div class="cart-preview">
          <!-- 购物车为空 -->
          <div v-if="cartStore.cartItems.length === 0" class="empty-cart-preview">
            <p>购物车空空如也～</p>
          </div>
          
          <!-- 购物车有商品 -->
          <div v-else>
            <!-- 数量超限提示 -->
            <div v-if="cartStore.cartItems.length >= 4" class="limit-tips">
              <i class="el-icon-warning"></i>
              <span>购物车商品已达4件，快去结算吧！</span>
            </div>
            
            <!-- 商品列表 -->
            <div class="cart-preview-items" :style="{ maxHeight: cartStore.cartItems.length >=4 ? '180px' : '240px' }">
              <div 
                v-for="item in cartStore.cartItems" 
                :key="item.cartItemId" 
                class="cart-preview-item"
              >
                <el-image 
                  :src="getCartItemImage(item.id)" 
                  fit="cover" 
                  class="item-img"
                />
                <div class="item-info">
                  <p class="item-name">{{ item.phoneName }}</p>
                  <p class="item-price">
                    ¥{{ item.price.toFixed(2) }} × {{ item.quantity }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- 统计信息 -->
            <div class="cart-preview-summary">
              <p>
                共 {{ cartStore.cartItems.length }} 件商品
                <span class="total-price">总价：¥{{ cartStore.totalAmount.toFixed(2) }}</span>
              </p>
            </div>
            
            <!-- 结算按钮 -->
            <el-button 
              type="primary" 
              class="checkout-btn"
              @click="router.push('/cart')"
              :disabled="cartStore.cartItems.length === 0"
            >
              去购物车结算
            </el-button>
          </div>
        </div>
        
        <template #reference>
          <div class="cart-nav-trigger">
            <el-icon><ShoppingCart /></el-icon>
            <span>我的购物车</span>
            <div 
              v-if="cartStore.cartItems.length > 0" 
              class="cart-badge"
              :class="{ 'badge-limit': cartStore.cartItems.length >=4 }"
            >
              {{ cartStore.cartItems.length > 9 ? '9+' : cartStore.cartItems.length }}
            </div>
          </div>
        </template>
      </el-popover>
    </el-menu-item>

    <!-- 用户头像+用户名 -->
    <el-menu-item 
      v-if="userStore.username" 
      index="6" 
      class="user-menu-item"
    >
      <el-avatar 
        :icon="UserFilled" 
        size="small" 
        class="user-avatar"
      /> 
      <span class="username-text">{{ userStore.username }}</span>
    </el-menu-item>
    <el-menu-item v-if="userStore.username" index="7" @click="handleLogout">安全退出</el-menu-item>
  </el-menu>

  <!-- 吸顶导航占位 -->
  <div style="width: 100%;height: 60px;"></div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Search, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElImage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useUserLoginStore } from '@/stores/userLogin'
import { useKeyWordsStore } from '@/stores/keywords'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const userStore = useUserLoginStore()
const keyStore = useKeyWordsStore()
const cartStore = useCartStore()

const activeIndex = ref('1')

// 监听路由变化更新选中状态
watch(() => route.path, (newPath) => {
  switch(newPath) {
    case '/':
      activeIndex.value = '1'
      break
    case '/login':
      activeIndex.value = '2'
      break
    case '/register':
      activeIndex.value = '3'
      break
    case '/orders':
      activeIndex.value = '4'
      break
    case '/cart':
      activeIndex.value = '5'
      break
    default:
      activeIndex.value = '1'
  }
}, { immediate: true })

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const input2 = ref('')

function handleSearch() {
  keyStore.search(input2.value)
  ElMessage.success('搜索成功！')
}

// 退出登录
function handleLogout() {
  userStore.username = ''
  ElMessage.success('退出成功!')
  router.push('/')
}

// 获取购物车商品图片
function getCartItemImage(id: number) {
  return new URL(`/src/assets/imgs/${id}.webp`, import.meta.url).href
}


const addToCartWithLimit = (phone: any) => {
  // 未登录判断
  if (!userStore.username) {
    ElMessage.warning('请先登录！')
    router.push('/login')
    return false
  }

  // 数量超限判断
  if (cartStore.cartItems.length >= 4) {
    ElMessage.warning('购物车商品最多添加4件，请先结算！')
    router.push('/cart') // 自动跳转到购物车
    return false
  }

  // 正常添加商品
  cartStore.addToCart(phone)
  ElMessage.success('商品添加成功！')
  return true
}
defineExpose({
  addToCartWithLimit
})
</script>

<style scoped>
/* 基础导航样式 */
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
.el-menu{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  z-index: 999;
  border: 0px 2px 4px rgba(0, 0, 0, .12);
  height: 60px;
  line-height: 60px;
}

/* 菜单项目通用样式 */
:deep(.el-menu-item) {
  display: flex !important;
  align-items: center !important;
  justify-content: center;
  padding: 0 15px;
  cursor: pointer;
}

/* 购物车导航项样式 */
:deep(.cart-nav-trigger) {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative; /* 角标定位父级 */
}

/* 核心：美化后的购物车角标 */
:deep(.cart-badge) {
  position: absolute;
  top: -8px;
  right: -12px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%; /* 圆形角标 */
  background: linear-gradient(135deg, #ff6b6b, #f56c6c); /* 渐变背景 */
  color: #fff;
  font-size: 12px;
  text-align: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3); /* 轻微阴影 */
  transition: all 0.3s ease;
}
/* 数量超限角标样式（变红+放大） */
:deep(.cart-badge.badge-limit) {
  background: linear-gradient(135deg, #ff4757, #ff3838);
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.5);
}

/* 购物车悬浮弹窗样式 */
:deep(.cart-popover) {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
  border: none;
}
.cart-preview {
  width: 100%;
}
/* 空购物车预览 */
.empty-cart-preview {
  padding: 30px 0;
  text-align: center;
  color: #909399;
}
/* 数量超限提示条 */
.limit-tips {
  padding: 8px 16px;
  background-color: #fff3cd;
  color: #856404;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #ffeeba;
}
.limit-tips .el-icon-warning {
  color: #ffc107;
}
/* 商品列表预览 */
.cart-preview-items {
  overflow-y: auto;
  padding: 10px 0;
}
.cart-preview-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
}
.item-img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.item-price {
  font-size: 13px;
  color: #f56c6c;
}
/* 购物车统计信息 */
.cart-preview-summary {
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-top: 1px solid #f5f5f5;
}
.total-price {
  font-weight: bold;
  color: #f56c6c;
  margin-left: 8px;
}
/* 结算按钮 */
.checkout-btn {
  width: 100%;
  border-radius: 0;
  background-color: #409eff;
  border: none;
}
.checkout-btn:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

/* 用户头像+用户名样式 */
:deep(.user-menu-item) {
  padding: 0 20px !important;
}
:deep(.user-avatar) {
  margin-right: 8px;
  background-color: #409eff;
  cursor: pointer;
  transition: all 0.3s ease;
}
:deep(.user-avatar:hover) {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}
:deep(.username-text) {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  :deep(.username-text) {
    max-width: 80px;
  }
  :deep(.el-menu-item) {
    padding: 0 10px !important;
  }
}
</style>