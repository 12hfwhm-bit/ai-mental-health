<template>
  <div>
     <PageHead title="咨询记录" />
     <el-table :data="tableData" style="width: 100%">
      <el-table-column label="会话ID" width="180" >
        <template #default="scope">
          <el-avatar :src="scope.row.userNickname">{{ scope.row.userNickname?.charAt(0) }}</el-avatar>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="情绪日志"  >
        <template #default="scope">
          <div class="session-title">{{ scope.row.sessionTitle }}</div>
          <div class="session-preview">{{ scope.row.lastMessageContent }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="messageCount" label="消息数" width="180" />
      <el-table-column prop="lastMessageTime" label="时间" width="180" />

      <el-table-column prop="name" label="操作" width="180" >
        <template #default="scope">
           <el-button type="primary" text @click="handleView(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination 
      style="margin-top: 25px"
      :page-size="pagination.size"
      layout="prev, pager, next" :total="pagination.total" 
      @current-change="handleCurrentChange"
    />
    <el-dialog 
    v-model="showDetailDialog"
    title="咨询会话详情"
    width="70%"
    :close-on-click-model="false"
    >
    <div class="session-detail">
      <div class="detail-header">
        <div class="detail-row">
          <div class="detail-label">用户：</div>
          <div class="detail-value">{{ sessionDetail.userNickname }}</div>
        </div>

         <div class="detail-row">
          <div class="detail-label">开始时间：</div>
          <div class="detail-value">{{ sessionDetail.createdAt }}</div>
        </div>

         <div class="detail-row">
          <div class="detail-label">消息数：</div>
          <div class="detail-value">{{ sessionDetail.messageCount }}</div>
        </div>
      </div>

      <!-- 下半部分 -->
       <div class="message-container">
        <div class="message-header">
          <h4>对话记录</h4>
        </div>
        <div class="message-list" v-loading="loadingMessages">
          <div v-for="message in sessionMessages" :key="message.id" class="message-item" :class="message.senderType === 1 ? 'user-message':'ai-message'">
             <div class="message-header">
              <span>{{ message.senderType === 1 ? '用户':'AI助手' }}</span>
              <span class="time">{{ message.createdAt }}</span>
             </div>
             <div class="message-content">
              {{ message.content }}
             </div>
          </div>
        </div>
       </div>

    </div>
    <template #footer>
      <el-button type="primary" @click="showDetailDialog = false">关闭</el-button>
    </template>
    </el-dialog>
  </div>
</template>

<script setup  >
import { ref, onMounted ,reactive} from 'vue';
import PageHead from '../components/PageHead.vue';
import { getConsultations,getSessionDetail } from '../api/admin';

import { ElMessage } from 'element-plus';

const tableData = ref([])
const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0
}) 

const handleSearch = () => {
  getConsultations(pagination).then(res => {
   if(res.code == 200){
     const {records,total}=res.data
     tableData.value=records || []
     pagination.total=total || 0
   }
  })
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  handleSearch()
}

onMounted(() => {
  handleSearch()
})

//详情
const showDetailDialog = ref(false)
const sessionDetail = ref({})
const sessionMessages = ref([])
const loadingMessages = ref(false)

const handleView = (row) => {
  loadingMessages.value = true
  getSessionDetail(row.id).then(res => {
    loadingMessages.value = false
     showDetailDialog.value = true
    if (res.code == 200) {
      sessionMessages.value = res.data || []
      sessionDetail.value = row
     
    }
  })
}
</script>

<style scoped lang="scss">
.session-title {
  font-weight: bold;
  color: #303133;
}

.session-preview {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-detail {
  max-height: 70vh;
  overflow-y: auto;

  .detail-header {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      font-weight: 500;
      color: #495057;
      min-width: 80px;
      margin-right: 8px;
    }

    .detail-value {
      color: #333;
    }
  }
}

.message-container {
  margin-top: 20px;

  .message-header {
    margin-bottom: 16px;

    h4 {
      margin: 0;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .message-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    background: #fff;

    .message-item {
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 8px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;

      &:last-child {
        margin-bottom: 0;
      }

      &.user-message {
        background: #e8f4fd;
        border-color: #d1e9fb;
      }

      &.ai-message {
        background: #f0f9f0;
        border-color: #e1f3e1;
      }

      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 13px;
        color: #606266;

        .time {
          color: #909399;
          font-size: 12px;
        }
      }

      .message-content {
        font-size: 14px;
        line-height: 1.6;
        color: #303133;
        white-space: pre-wrap;
      }
    }
  }
}
</style>
