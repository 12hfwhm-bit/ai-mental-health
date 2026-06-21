<template>
  <div class="navbar">
    <div class="flex-box">
      <!-- 默认插槽（没有#，内容直接写在组件标签内部） -->
      <el-button @click="handleCollapseClick">
        <el-icon>
          <Expand />
        </el-icon>
      </el-button>
      <p class="page-title"> {{ route.meta.title }}</p>
    </div>
    <div class="flex-box">
      <el-dropdown @command="handleCommand">
        <div class="flex-box">
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <p class="user-name">张三</p>
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>
        <!-- 具名插槽（需要用#指定名字） -->
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>

      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminStore } from '@/stroes/admin'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown, Expand } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { logout } from '@/api/admin'

const router = useRouter()
const route = useRoute()

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('退出登录成功')
      logout().then(() => {
        // 清除本地存储中的用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')

        // 跳转到登录页
        router.push('/auth/login')
      })
    })
  }
}

const handleCollapseClick = () => {
  useAdminStore().toggleIsCollapse()
}


</script>

<style scoped lang="scss">
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .page-title {
    font-size: 18px;
    font-weight: bold;
    margin-left: 15px;
  }

  .flex-box {
    display: flex;
    align-items: center;

    .user-name {
      margin: 0 10px;
      font-size: 14px;
      color: #303133;
    }
  }
}
</style>