<template>
  <div class="emotionDiary-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="imgUrl" alt="like" class="icon-image" style="width: 60px; height: 60px;"></el-image>
        <h1>情绪日记</h1>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="content">
      <!-- 评分 -->
      <div class="diary-card">
        <div class="title">今日情绪评分</div>
        <div class="section">
          <p>请根据以下问题，对您的情绪进行评分：</p>
          <div class="rate">
            <el-rate v-model="diaryForm.moodScore" :show-text="true" size="large" :max="10" :texts="emotionStatus" />
          </div>
        </div>
      </div>
      <!-- 主要情绪 -->
      <div class="diary-card">
        <div class="title">主要情绪</div>
        <div class="emotion-grid">
          <div class="emotion-card" :class="{ 'selected': emotion.name === diaryForm.dominantEmotion }"
            v-for="emotion in emotionOptions" :key="emotion.name" @click="selectEmotion(emotion.name)">
            <el-image :src="emotion.url" alt="emotion" class="emotion-image"
              style="width: 40px; height: 40px;"></el-image>
            <div class="emotion-name">{{ emotion.name }}</div>
          </div>
        </div>
      </div>

      <!-- 详细记录 -->
      <div class="diary-card">
        <div class="title">详细记录</div>
        <div class="detail-form">
          <div class="form-group">
            <div class="form-label">情绪触发因素：</div>
            <el-input v-model="diaryForm.emotionTriggers" placeholder="请输入情绪触发因素" type="textarea" :rows="4"
              maxlength="1000" show-word-limit>
            </el-input>
          </div>

          <div class="form-group">
            <div class="form-label">今日感想</div>
            <el-input v-model="diaryForm.diaryContent" placeholder="请输入今日感想" type="textarea" :rows="5" maxlength="1000"
              show-word-limit>
            </el-input>
          </div>

          <!-- 睡眠质量 -->
          <div class="life-indicators">
            <div class="indicator-group">
              <div class="form-label">睡眠质量：</div>
              <el-select v-model="diaryForm.sleepQuality" placeholder="请选择睡眠质量">
                <el-option label="很差" :value="1" />
                <el-option label="一般" :value="2" />
                <el-option label="好" :value="3" />
                <el-option label="非常好" :value="4" />
                <el-option label="极致" :value="5" />
              </el-select>
            </div>
            <div class="indicator-group">
              <div class="form-label">压力等级：</div>
              <el-select v-model="diaryForm.stressLevel" placeholder="请选择压力等级">
                <el-option label="低" :value="1" />
                <el-option label="中" :value="3" />
                <el-option label="高" :value="5" />
              </el-select>
            </div>
          </div>
          <!-- 按钮 -->
          <div class="action-buttons">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitForm">提交</el-button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElImage, ElMessage } from 'element-plus'
import { dayjs } from 'element-plus'
import { submitEmotionDiary } from '@/api/frontend'



//情绪状态
const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福']
//情绪选项
const emotionOptions = [
  { name: '开心', url: new URL('../assets/开心.png', import.meta.url).href },
  { name: '平静', url: new URL('../assets/平静.png', import.meta.url).href },
  { name: '焦虑', url: new URL('../assets/焦虑.png', import.meta.url).href },
  { name: '兴奋', url: new URL('../assets/兴奋.png', import.meta.url).href },
  { name: '疲惫', url: new URL('../assets/疲惫.png', import.meta.url).href },
  { name: '悲伤', url: new URL('../assets/悲伤.png', import.meta.url).href },
  { name: '困惑', url: new URL('../assets/困惑.png', import.meta.url).href },
  { name: '惊讶', url: new URL('../assets/惊讶.png', import.meta.url).href },
]
//选择情绪
const selectEmotion = (emotion) => {
  diaryForm.dominantEmotion = emotion
}

const diaryForm = reactive({
  userId: null,
  diaryDate: dayjs().format('YYYY-MM-DD'),
  moodScore: 0,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: null,
  stressLevel: null,
})

onMounted(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  diaryForm.userId = userInfo.id || userInfo.userId
})

//重置表单
const resetForm = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  // 逐个重置字段，确保响应式更新
  diaryForm.userId = userInfo.id || userInfo.userId
  diaryForm.diaryDate = dayjs().format('YYYY-MM-DD')
  diaryForm.moodScore = 0
  diaryForm.dominantEmotion = ''
  diaryForm.emotionTriggers = ''
  diaryForm.diaryContent = ''
  diaryForm.sleepQuality = null
  diaryForm.stressLevel = null
}

//提交表单
const submitForm = () => {
  // 确保提交前获取最新的 userId
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  diaryForm.userId = userInfo.id || userInfo.userId

  console.log('提交的数据：', diaryForm)

  if (!diaryForm.dominantEmotion) {
    ElMessage.error('请选择主导情绪')
    return
  }
  if (diaryForm.moodScore === 0) {
    ElMessage.error('请进行情绪评分')
    return
  }

  submitEmotionDiary(diaryForm).then(res => {
    // 使用 == 200 兼容字符串或数字类型的状态码
    if (res.code == 200) {
      ElMessage.success('提交成功')
      resetForm()
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  }).catch(err => {
    console.error('提交出错：', err)
    ElMessage.error('系统错误，请稍后再试')
  })
}



const imgUrl = new URL('../assets/like.png', import.meta.url).href
</script>
<style scoped lang="scss">
.emotionDiary-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .header-section {
    background: linear-gradient(135deg, #7ED321 0%, #F5A623 100%);
    color: white;
    padding: 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

      .title {
        margin-bottom: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #374151;
      }

      .section {
        margin-bottom: 20px;

        p {
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 15px;
        }
      }

      .emotion-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .emotion-card {
          padding: 15px;
          border: 2px solid #E5E7EB;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          background: #F9FAFB;

          .emotion-name {
            margin-top: 10px;
            padding: 0 75px;
            color: #374151;
          }

          &.selected {
            border-color: #7ED321;
            background: #F0FDF4;
            transform: translateY(-3px);
          }
        }
      }

      .detail-form {
        .form-label {
          margin: 10px 0;
          color: #374151;
        }

        .life-indicators {
          display: flex;
          gap: 20px;

          .indicator-group {
            flex: 1;
          }
        }

        .action-buttons {
          margin-top: 40px
        }
      }
    }
  }
}
</style>