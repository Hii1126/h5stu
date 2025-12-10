<template>
  <div class="carousel-container">
    <el-carousel 
      height="300px" 
      indicator-position="outside"
      :autoplay="true"
      :interval="4000"
      arrow="hover"
    >
      <el-carousel-item v-for="(item, index) in images" :key="index">
        <div class="carousel-item-wrapper">
          <img 
            class="carousel-image"
            :src="item.url"
            loading="lazy"
          />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
  import {ref}from 'vue'

// 轮播图图片路径数组
const images=ref([
  {url: new URL('/src/assets/imgs/1.webp', import.meta.url).href},
  {url: new URL('/src/assets/imgs/2.webp', import.meta.url).href},
  {url: new URL('/src/assets/imgs/3.webp', import.meta.url).href},
  {url: new URL('/src/assets/imgs/4.webp', import.meta.url).href},
  {url: new URL('/src/assets/imgs/5.webp', import.meta.url).href},
  {url: new URL('/src/assets/imgs/6.webp', import.meta.url).href},
  {url: new URL('/src/assets/imgs/7.webp', import.meta.url).href},
  {url: new URL('/src/assets/imgs/8.webp', import.meta.url).href},
])

</script>

<style scoped>
/* 轮播图容器 */
.carousel-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* 轮播项包装器 - 用于居中图片 */
.carousel-item-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5; 
  border-radius: 12px; /* 圆角效果 */
  overflow: hidden;
}

/* 轮播图片样式 - 保持原始比例 */
.carousel-image {
  max-width: 100%;
  max-height: 100%; 
  object-fit: contain; 
  transition: transform 0.5s ease; 
}

/* 图片悬停放大效果 */
.carousel-item-wrapper:hover .carousel-image {
  transform: scale(1.05); 
}

/* 轮播指示器样式 */
.el-carousel__indicators--outside {
  margin-top: 20px;
}

.el-carousel__indicator {
  margin: 0 8px; /* 指示器间距 */
}

.el-carousel__indicator button {
  width: 12px;
  height: 12px;
  border-radius: 50%; /* 圆形指示器 */
  background-color: #e0e0e0; /* 未激活颜色 */
  transition: all 0.3s ease; /* 过渡效果 */
  border: none; /* 移除边框 */
}

.el-carousel__indicator.is-active button {
  width: 30px; /* 激活状态变宽 */
  border-radius: 6px; /* 激活状态变为圆角矩形 */
  background-color: #409eff; /* 激活颜色 */
}

/* 轮播箭头样式 */
.el-carousel__arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 圆形箭头 */
  background-color: rgba(255, 255, 255, 0.8); /* 半透明白色背景 */
  color: #333; /* 箭头颜色 */
  transition: all 0.3s ease; /* 过渡效果 */
  opacity: 0.6; /* 默认透明度 */
}

.el-carousel__arrow:hover {
  background-color: rgba(255, 255, 255, 1); /* 悬停时不透明 */
  color: #409eff; /* 悬停时箭头变色 */
  opacity: 1; /* 悬停时完全显示 */
}

</style>