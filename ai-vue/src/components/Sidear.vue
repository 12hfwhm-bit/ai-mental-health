<template>
  <el-aside :width="isCollapse ? '64px' : '264px'">
         <el-menu
        :collapse="isCollapse"
        default-active="2"
        @open="handleOpen"
        @close="handleClose"
        :collapse-transition="false"
        :unique-opened="true"
        :router="true"
         
        class="sidebar-menu"
      >
      <div class="brand">
        <el-image style="width: 50px; height: 50px; margin-right: 15px;" :src="logoUrl" alt="logo"   />
        <div v-show="!isCollapse" class="info-card">
          <h1 class="brand-title">心理健康AI助手</h1>
           <p class="brand-description">管理后台</p>
        </div>
      </div>
      <el-menu-item @click="selectMenu" v-for="item in backendRoute.children" :key="item.path" :index="item.path">
        <el-icon><component :is="Icons[item.meta.icon]"/></el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>
      </el-menu>
    </el-aside>
</template>

<script setup>
import * as Icons from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stroes/admin'
import { computed } from 'vue'
const router = useRouter()

// 查找后台路由配置
const backendRoute = router.options.routes.find(r => r.path === '/back') || { children: [] }

const logoUrl = new URL('../assets/机器人.png', import.meta.url).href
// 监听isCollapse变化
const isCollapse = computed(() => useAdminStore().isCollapse)


 const handleOpen=()=>{


 }
 const handleClose=()=>{

 }
 const selectMenu=(item)=>{
    // item 是 el-menu-item 的实例，可以通过 index 获取路径
    router.push(`/back/${item.index}`)
 }
</script>

<style scoped lang="scss">
.sidebar-menu{
  height: 100%;
  .brand{
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  .info-card{
    .brand-title{
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #303133;
    }
    .brand-description{
      font-size: 16px;
      color: #606266;
    }
  }
}
}
 
</style>