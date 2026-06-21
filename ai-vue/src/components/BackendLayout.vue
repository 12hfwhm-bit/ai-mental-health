<template>
    <div class="backend-layout">
    <el-container class="content-container">
        <Sidear />
      <el-container >
        <!-- 导航栏 -->
        <el-header><Navbar /></el-header>
        <!-- 主内容区域 -->
        <el-main class="main-content"> <router-view class="main-content"></router-view></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
// 导入逻辑
 import Sidear from '@/components/Sidear.vue'
 import Navbar from '@/components/Navbar.vue'
 
</script>

 <style lang="scss" scoped>
.backend-layout {
  height: 100vh;
  .el-header{
    height: 74px;
  }
  .content-container{
    height: 100%;
    .main-content{
      padding: 20px;
      background-color: #fff;
      min-height: calc(100% - 74px);
    }
     
  }
}



</style>
 