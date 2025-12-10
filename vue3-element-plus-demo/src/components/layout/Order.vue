<template>
  <div class="orders-container">
    <h2>我的订单</h2>
    
    <!-- 订单为空提示 -->
    <div v-if="userOrders.length === 0" class="empty-orders">
      <p>暂无订单记录，快去下单吧～</p>
    </div>

    <!-- 订单列表 + 分页 -->
    <div v-else class="order-wrap">
      <!-- 订单表格 -->
      <el-table
        :data="currentOrders"
        border
        stripe
        style="width: 100%"
        :loading="false"
      >
        <el-table-column prop="id" label="订单ID" min-width="180" />
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          :formatter="formatDate"
        />
        <el-table-column prop="totalItems" label="商品数量" width="120" />
        <el-table-column
          prop="totalAmount"
          label="订单金额"
          width="120"
          :formatter="formatPrice"
        />
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
              disable-transitions
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === '未支付'"
              type="primary"
              size="small"
              @click="payOrder(scope.row.id)"
            >
              立即支付
            </el-button>
            <el-button
              v-else-if="scope.row.status === '已支付'"
              type="success"
              size="small"
              @click="refundOrder(scope.row.id)"
            >
              申请退款
            </el-button>
            <el-button
              type="info"
              size="small"
              icon="el-icon-view"
              @click="viewOrderDetail(scope.row)"
              style="margin-left: 8px"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrap">
        <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :total="userOrders.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOrderStore } from '@/stores/order'
import { ElMessage } from 'element-plus'
import type { Order } from '@/stores/order'
import { formatPriceDisplay } from '@/utils/price'
import { Decimal } from 'decimal.js'

// Store 实例
const orderStore = useOrderStore()

// 分页参数
const currentPage = ref(1)
const pageSize = ref(5) // 每页显示5条

// 获取当前用户订单
const userOrders = computed(() => orderStore.getCurrentUserOrders())

// 计算当前页订单
const currentOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return userOrders.value.slice(start, end)
})

// 处理分页切换
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 格式化日期
const formatDate = (row: Order) => {
  const date = new Date(row.createTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (row: Order) => {
  return formatPriceDisplay(row.totalAmount)
}

// 获取状态标签类型
const getStatusTagType = (status: Order['status']) => {
  switch (status) {
    case '未支付':
      return 'warning'
    case '已支付':
      return 'success'
    case '退款成功':
      return 'info'
    default:
      return 'info'
  }
}

// 立即支付
const payOrder = (orderId: string) => {
  orderStore.updateOrderStatus(orderId, '已支付', new Date().toISOString())
  ElMessage.success('支付成功！')
}

// 申请退款
const refundOrder = (orderId: string) => {
  orderStore.updateOrderStatus(orderId, '退款成功')
  ElMessage.success('退款申请已提交，处理中...')
}

// 查看订单详情
const viewOrderDetail = (order: Order) => {
  console.log('订单详情：', order)
  ElMessage.info(`订单 ${order.id} 详情已展开（实际业务可弹窗/跳转）`)
}
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.empty-orders {
  text-align: center;
  padding: 80px 0;
  color: #909399;
  font-size: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.order-wrap {
  margin-top: 20px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px;
}
</style>