<template>
  <div class="container">
    <div class="title">
      <div class="back" @click="goBack">
        <el-icon class="icon">
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </div>
      <div class="title-header">
        <h2>登录您的账号</h2>
        <span>或使用手机号登录</span>
      </div>
    </div>
    <div class="form-container">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-position="top">
        <el-form-item label="用户名和邮箱" prop="username">
          <el-input v-model="formData.username" size="large" placeholder="请输入用户名或邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" size="large" placeholder="请输入密码" type="password" show-password />
        </el-form-item>
        <!-- 登录按钮 -->
        <el-button class="btn" size="large" type="primary" @click="submitForm(ruleFormRef)">登录</el-button>
      </el-form>

      <div class="footer">
        <p>还没有账号？<router-link to="/auth/register">点击去注册</router-link></p>

      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, toRaw } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { login } from '@/api/admin'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
//校验表单
const ruleFormRef = ref(null)

const formData = ref({
  username: '',
  password: ''
})

const rules = ref({
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

//返回上一页
const goBack = () => {
  router.back()
}

//登录方法
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 使用 toRaw 确保传递的是纯对象，避免循环引用报错
      login(toRaw(formData.value)).then(res => {
        if (!res.data || !res.data.token) {
          return ElMessage.error(res.msg || '登录失败')
        }
        //登录成功
        ElMessage.success('登录成功')
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
        //根据用户角色跳转
        if (res.data.userInfo.userType == 2) {
          router.push('/back/dashboard')
        } else {
          router.push('/')
        }

      }).catch(err => {
        console.error('登录请求失败:', err)
      })
      console.log('校验通过')
    } else {
      console.log('校验失败', fields)
    }
  })
}
</script>

<style scoped lang="scss">
.container {
  width: 384px;

  .title {
    .back {
      margin-bottom: 60px;
      font-size: 20px;

      .icon {
        font-size: 20px;
      }

    }

    .title-header {
      text-align: center;

      h2 {
        font-style: 24px;
        margin-bottom: 10px;
      }

      p {
        font-style: 16px;
        color: #b9b5b5;
      }
    }
  }

  .form-container {
    margin-top: 30px;

    .btn {
      margin-top: 30px;
      width: 100%;
    }

    .footer {
      text-align: center;

      p {
        margin-top: 30px;
        font-style: 16px;

      }
    }
  }
}
</style>