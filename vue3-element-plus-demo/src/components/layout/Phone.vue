<template>
  <div class="phone-container">
    <h2>手机列表</h2>
    <el-row :gutter="20">
      <el-col :span="6" v-for="phone in filteredPhones" :key="phone.id">
        <div class="grid-content">
          <div class="phone-card">
            <el-image 
              :src="getCorrectImageUrl(phone.id)" 
              fit="cover" 
              class="phone-img" 
              :error="errorImg"
            ></el-image>
            <div class="phone-info">
              <h3>{{ phone.phoneName }}</h3>
              <p class="phone-remark">{{ phone.remark }}</p>
              <div class="phone-price">
                <span class="current-price">¥{{ phone.price }}</span>
                <span v-if="phone.originalPrice" class="original-price">¥{{ phone.originalPrice }}</span>
                <span class="cart">
                  <el-icon @click="addTocart(phone)">
                    <ShoppingTrolley />
                  </el-icon>
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import router from '@/router'
import { ref, onMounted, computed} from 'vue'
import { useKeyWordsStore } from '@/stores/keywords'
import { useCartStore } from '@/stores/cart'
import { useUserLoginStore } from '@/stores/userLogin'
import { ElRow, ElCol, ElImage,ElMessage } from 'element-plus'
import { ShoppingTrolley } from '@element-plus/icons-vue'

// 手机类型定义
interface Phone {
  id: number
  phoneName: string
  remark: string
  price: number
  originalPrice: number | null
  img_url: string
}

const phones = ref<Phone[]>([
  { id: 1, phoneName: 'REDMI K90 Pro Max', remark: '第五代 骁龙®8至尊版 | 超级像素护眼', price: 3999, originalPrice: null, img_url: '@/imgs/1.webp' },
  { id: 2, phoneName: 'REDMI K90', remark: '骁龙®8至尊版 | Sound by Bose 联合', price: 2599, originalPrice: null, img_url: '@/imgs/2.webp' },
  { id: 3, phoneName: 'Xiaomi 17 Pro Max', remark: '徕卡光影大师 移动影像系统 | 徕卡5X', price: 5999, originalPrice: null, img_url: '@/imgs/3.webp' }
])

const keyStore = useKeyWordsStore()
const cartStore = useCartStore()
const userLogin = useUserLoginStore()

function getCorrectImageUrl(id: number) {
  return new URL(`/src/assets/imgs/${id}.webp`, import.meta.url).href
}

// 错误图片
const errorImg = new URL('/src/assets/imgs/element-plus-logo.svg', import.meta.url).href

// 搜索筛选后的手机数据
const filteredPhones = computed(() => {
  if (!keyStore.keyWords) {
    return phones.value
  }
  const keyword = keyStore.keyWords.toLowerCase()
  return phones.value.filter(phone => 
    phone.phoneName.toLowerCase().includes(keyword) || 
    phone.remark.toLowerCase().includes(keyword)
  )
})

onMounted(async () => {
  try {
    const response = await axios.get('/phone.json')
    phones.value = response.data.data
  } catch (error) {
    console.error('获取手机数据失败:', error)
    console.log('使用静态数据')
  }
})

// 添加到购物车
function addTocart(phone: Phone) {
  // 1. 未登录判断
  if (!userLogin.username) {
    ElMessage({
      message: '请先登录',
      type: 'warning',
    })
    router.push('/login')
    return
  }

  // 2. 购物车数量限制
  if (cartStore.cartItems.length >= 4) {
    ElMessage({
      message: '购物车商品已达件上限，请先结算！',
      type: 'warning',
    })
    router.push('/cart') // 自动跳转到购物车
    return
  }

  // 3. 正常添加商品
  cartStore.addToCart(phone)
  ElMessage({
    message: '商品添加成功！',
    type: 'success',
  })
}
</script>

<style scoped>
.phone-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.grid-content {
  margin-bottom: 20px;
}

.phone-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.phone-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.phone-img {
  width: 100%;
  height: 200px;
}

.phone-info {
  padding: 15px;
}

.phone-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.phone-remark {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.phone-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  color: #909399;
  font-size: 14px;
  text-decoration: line-through;
  margin-left: 10px;
}

.cart {
  cursor: pointer;
  color: #409eff;
  font-size: 20px;
}

.cart:hover {
  color: #66b1ff;
}
</style>