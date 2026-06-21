<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar users">
              <el-image :src="iconUrl1" style="width: 32px; height: 32px" />
            </div>
            <div class="info">
              <p class="title">总用户数</p>
              <p class="number">{{ aiData.systemOverview.totalUsers || 0 }}</p>
              <p class="subtitle-title">活跃用户：{{ aiData.systemOverview.activeUsers || 0 }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar like">
              <el-image :src="iconUrl2" style="width: 32px; height: 32px" />
            </div>
            <div class="info">
              <p class="title">情绪日志</p>
              <p class="number">{{ aiData.systemOverview.totalDiaries || 0 }}</p>
              <p class="subtitle-title">活跃用户：{{ aiData.systemOverview.totalDiaries || 0 }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar comments">
              <el-image :src="iconUrl3" style="width: 32px; height: 32px" />
            </div>
            <div class="info">
              <p class="title">咨询会话</p>
              <p class="number">{{ aiData.systemOverview.totalSessions || 0 }}</p>
              <p class="subtitle-title">今日新增：{{ aiData.systemOverview.todayNewSessions || 0 }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar smile">
              <el-image :src="iconUrl4" style="width: 32px; height: 32px" />
            </div>
            <div class="info">
              <p class="title">平均情绪</p>
              <p class="number">{{ aiData.systemOverview.avgMooodScore }}/10</p>
              <p class="subtitle-title">情绪健康指数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 情绪趋势分析图表 -->
    <el-row style="margin-top: 20px;" :gutter="20">
      <el-col :span="12">
        <el-card style="width: 100%;">
          <template #header>
            <div class="card-header">
              情绪趋势分析
            </div>
          </template>
          <div class="chart-content">
            <div ref="emotionCartRef" style="width: 100%; height: 350px"></div>
          </div>
        </el-card>
      </el-col>
      <!-- 咨询会话统计图表 -->
      <el-col :span="12">
        <el-card v-if="aiData.consultationStats" style="width: 100%;">
          <template #header>
            <div class="card-header">
              咨询会话统计
            </div>
          </template>
          <div class="chart-content">
            <div class="consultation-stats">
              <div class="stat-item">
                <div class="stat-label">会话总数</div>
                <div class="stat-value">{{ aiData.consultationStats.totalSessions || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均时长</div>
                <div class="stat-value">{{ aiData.consultationStats.avgSessionDuration || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value">{{ aiData.consultationStats.activeUsers || 0 }}</div>
              </div>
            </div>
            <div ref="consultationCartRef" style="width: 100%; height: 280px"></div>
          </div>
        </el-card>

      </el-col>
    </el-row>
    <!-- 用户活跃度趋势分析图表 -->
    <el-row style="margin-top: 20px;" :gutter="20">
      <el-card style="width: 100%;">
        <template #header>
          <div class="card-header">
            用户活跃度趋势分析
          </div>
        </template>
        <div class="chart-content">
          <div ref="userActiveCartRef" style="width: 100%; height: 350px"></div>
        </div>
      </el-card>

    </el-row>

  </div>
</template>

<script setup>
import { onMounted, reactive, nextTick } from 'vue';
import { getAnalyticsOverview } from '@/api/admin';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import * as echarts from 'echarts';

//统计图片引入
const iconUrl1 = new URL('../assets/users.png', import.meta.url).href
const iconUrl2 = new URL('../assets/like.png', import.meta.url).href
const iconUrl3 = new URL('../assets/comments.png', import.meta.url).href
const iconUrl4 = new URL('../assets/smile.png', import.meta.url).href

const aiData = ref({})
const emotionCartRef = ref(null)
let emotionChart = null
//初始化图标
const initCharts = () => {
  initEmotionChart()
  initConsultationChart()
  initUserActiveChart()
}

//初始化图表
const initEmotionChart = () => {
  if (!emotionCartRef.value) return
  if (emotionChart) emotionChart.dispose()
  //创建实例
  emotionChart = echarts.init(emotionCartRef.value)
  //获取数据
  const TrendData = aiData.value.emotionTrend || []

  //配置
  const options =
  {
    title: {
      text: '情绪趋势分析',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#2c3e50'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      borderColor: '#fab1a0',
      borderWidth: 1,
      textStyle: {
        color: '#2c3e50'
      }
    },
    legend: {
      show: true,
      bottom: 10,
      left: 'center'
    },
    grid: {
      top: 70,
      bottom: 60,
      left: '3%',
      right: '4%',
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: TrendData.map(item => item.date || item.data),
      axisLine: {
        lineStyle: {
          color: '#fab1a0'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '情绪评分',
        position: 'left',
        min: 0,
        max: 10,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#fab1a0'
          }
        }
      },
      {
        type: 'value',
        name: '记录数',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#eeb5a3'
          }
        }
      }
    ],
    series: [
      {
        name: '情绪评分',
        type: 'line',
        data: TrendData.map(item => item.avgMooodScore),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#f6d365'
        },
        itemStyle: {
          color: '#f6d365'
        },
      },

      {
        name: '记录数',
        type: 'line',
        data: TrendData.map(item => item.recordCount),
        yAxisIndex: 1,
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#eeb5a3'
        },
        itemStyle: {
          color: '#eeb5a3'
        },
      }
    ]
  }
  emotionChart.setOption(options)
}
//用户活跃度趋势分析
const userActiveCartRef = ref(null)
let userActiveChart = null
const initUserActiveChart = () => {
  if (!userActiveCartRef.value) return
  if (userActiveChart) userActiveChart.dispose()
  //创建实例
  userActiveChart = echarts.init(userActiveCartRef.value)
  //获取数据
  const activityData = aiData.value.userActivity || []

  const option = {
    title: {
      text: '用户活跃度趋势',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#2d3436'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#fab1a0',
      borderWidth: 1,
      textStyle: {
        color: '#2d3436'
      }
    },
    legend: {
      data: ['活跃用户', '新增用户', '日记用户', '咨询用户'],
      top: 40,
      textStyle: {
        color: '#636e72'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 80,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: activityData.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)'
        }
      },
      axisLabel: {
        color: '#636e72'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#636e72'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.1)'
        }
      }
    },
    series: [
      {
        name: '活跃用户',
        type: 'line',
        data: activityData.map(item => item.activeUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#a29bfe'
        },
        itemStyle: {
          color: '#a29bfe'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(162, 155, 254, 0.4)' },
              { offset: 1, color: 'rgba(162, 155, 254, 0.1)' }
            ]
          }
        }
      },
      {
        name: '新增用户',
        type: 'line',
        data: activityData.map(item => item.newUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#fdcb6e'
        },
        itemStyle: {
          color: '#fdcb6e'
        }
      },
      {
        name: '日记用户',
        type: 'line',
        data: activityData.map(item => item.diaryUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#00b894'
        },
        itemStyle: {
          color: '#00b894'
        }
      },
      {
        name: '咨询用户',
        type: 'line',
        data: activityData.map(item => item.consultationUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#fab1a0'
        },
        itemStyle: {
          color: '#fab1a0'
        }
      }
    ]
  }
  userActiveChart.setOption(option)
}

onMounted(async () => {
  try {
    const res = await getAnalyticsOverview()
    if (res.code == 200) {
      ElMessage.success('获取成功')
      console.log(res.data);
      aiData.value = res.data
      await nextTick()
      initCharts()

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        emotionChart && emotionChart.resize()
        consultationChart && consultationChart.resize()
        userActiveChart && userActiveChart.resize()
      })
    }
  } catch (error) {
    ElMessage.error('获取失败')
  }
})
//会话趋势分析
const consultationCartRef = ref(null)
let consultationChart = null
const initConsultationChart = () => {
  if (!consultationCartRef.value) return
  if (consultationChart) consultationChart.dispose()
  //创建实例
  consultationChart = echarts.init(consultationCartRef.value)
  //获取数据
  const ConsultationTrend = aiData.value.consultationStats.dailyTrend || []


  const option = {
    title: {
      text: '咨询活动统计',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#2d3436'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#fab1a0',
      borderWidth: 1,
      textStyle: {
        color: '#2d3436'
      }
    },
    legend: {
      show: true,
      bottom: 10,
      left: 'center',
      textStyle: {
        color: '#636e72'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: 60,
      top: 70,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ConsultationTrend.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)'
        }
      },
      axisLabel: {
        color: '#636e72'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#636e72'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.1)'
        }
      }
    },
    series: [
      {
        name: '会话数量',
        type: 'bar',
        data: ConsultationTrend.map(item => item.sessionCount),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#74b9ff' },
              { offset: 1, color: '#0984e3' }
            ]
          }
        },
        barWidth: '40%'
      },
      {
        name: '参与用户数',
        type: 'bar',
        data: ConsultationTrend.map(item => item.userCount),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#fdcb6e' },
              { offset: 1, color: '#f39c12' }
            ]
          }
        },
        barWidth: '40%'
      }
    ]
  }
  consultationChart.setOption(option)
}
</script>
<style scoped lang="scss">
.dashboard-container {
  .card-content {
    display: flex;
    align-items: center;

    .avatar {
      margin-right: 12px;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.users {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.like {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.comments {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.smile {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .info {
      .title {
        font-size: 14px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }

      .value {
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4px
      }

      .subtitle-title {
        font-size: 12px;
        color: #95a5a6;
      }
    }
  }

  .chart-content {
    padding: 20px;
    position: relative;

    .consultation-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 12px;
          color: #7f8c8d;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }
      }
    }
  }
}
</style>
