<template>
  <div class="container">
    <div class="title">
      <div class="back" @click="goBack">
        <el-icon class="icon">
          <ArrowLeft />
        </el-icon>
        <span>返回</span>
      </div>
      <div class="title-text">
        <h2>创建您的账号</h2>
        <p>开始使用心理健康助手。</p>
      </div>
    </div>
    <div class="form-container">
      <el-form :model="formData" :rules="rules" ref="submitFormRef" label-width="120px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" size="large" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" size="large" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" size="large" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" placeholder="请输入密码" type="password" size="large" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" placeholder="请确认密码" type="password" size="large" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="submitForm(submitFormRef)" class="btn">注册</el-button>
        </el-form-item>
      </el-form>
    </div>



  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { register } from '@/api/frontend.js';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

const router = useRouter();

//返回上一页
const goBack = () => {
  router.back()
};
const formData = reactive({
  "username": "",
  "email": "",
  "nickname": "",
  "phone": "",
  "password": "",
  "confirmPassword": "",
  "gender": 0,
  "userType": 1//用户类型 1: 普通用户 2: 管理员
});

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },

  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
});

//表单提交
const loading = ref(false);
const submitFormRef = ref(null);

const submitForm = async (formEl) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      register(formData).then((data) => {
        console.log('注册响应完整数据:', data);
        console.log('响应code:', data?.code);
        console.log('响应msg:', data?.msg);
        if (data && data.code == 200) {
          ElMessage.success('注册成功');
          router.push({ path: '/auth/login' });
        } else {
          let errorMsg = data?.msg || '注册失败，请稍后重试';
          console.log('处理前的错误消息:', errorMsg);
          // 根据错误消息内容显示更具体的提示
          if (errorMsg.includes('用户名') || errorMsg.includes('username') || errorMsg.includes('user')) {
            errorMsg = '用户名已存在，请更换用户名';
          } else if (errorMsg.includes('邮箱') || errorMsg.includes('email') || errorMsg.includes('mail')) {
            errorMsg = '邮箱已被注册，请更换邮箱';
          }
          console.log('最终显示的错误消息:', errorMsg);
          ElMessage.error(errorMsg);
        }
      }).catch((error) => {
        console.error('注册错误:', error);
        let errorMsg = error?.response?.data?.msg || error?.message || '注册失败，请稍后重试';
        if (errorMsg.includes('用户名') || errorMsg.includes('username') || errorMsg.includes('user')) {
          errorMsg = '用户名已存在，请更换用户名';
        } else if (errorMsg.includes('邮箱') || errorMsg.includes('email') || errorMsg.includes('mail')) {
          errorMsg = '邮箱已被注册，请更换邮箱';
        }
        ElMessage.error(errorMsg);
      });
    }
  })
}

</script>

<style scoped lang="scss">
.container {
  width: 384px;

  .flex-box {
    display: flex;
    align-items: center;
  }

  .title {
    .back {
      margin-bottom: 60px;
      font-size: 20px;
      cursor: pointer;

      .icon {
        font-size: 20px;
      }
    }

    .title-text {
      text-align: center;

      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }

      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
  }

  .form-container {
    margin-top: 30px;

    .btn {
      margin-top: 40px;
      width: 100%;
    }

    .footer {
      padding: 30px;
      text-align: center;
    }
  }
}
</style>