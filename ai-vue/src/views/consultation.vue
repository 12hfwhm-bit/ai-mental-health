<template>
  <div class="consultation-container">
    <div class="sidebar">
      <!-- 心理健康AI助手信息 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image :src="iconUrl" style="width: 25px; height: 25px; " alt="心理助手图标" />
        </div>
        <div class="assistant-name">心理助手</div>
        <div class="online-status">
          <div class="status-dot"></div>
          <span>在线服务中</span>
        </div>
      </div>
      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">情绪花园</div>
        </div>
        <div class="emotion-info">
          <div class="emotion-name">当前情绪</div>
          <div class="emotion-score">50</div>
        </div>
        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今天感觉</span>
            <span class="status-emotion">{{ currentEmotion.isNegative ? '需要关注' : '正面情绪' }}</span>
          </div>
          <div class="emotion-intensity">
            <span class="intensity-dots">
              <span v-for="dot in 3" :key="dot" class="dot"
                :class="{ 'active': getIntensityClass(currentEmotion.emotionScore) >= dot }">
              </span>
            </span>
            <span class="intensity-text">{{ getRiskText(currentEmotion.riskLevel) }}</span>
          </div>
          <!-- 给你的小建议卡片 -->
          <div class="warm-suggestion" v-if="currentEmotion.suggestion">
            <div class="suggestion-icon">❤️</div>
            <div class="suggestion-content">
              <div class="suggestion-title">给你的小建议</div>
              <div class="suggestion-text">
                {{ currentEmotion.suggestion }}
              </div>

            </div>
          </div>
          <!-- 治愈行动 -->
          <div class="healing-actions"
            v-if="currentEmotion.improvementSuggestions && currentEmotion.improvementSuggestions.length > 0">
            <div class="action-title">治愈小行动</div>
            <div class="action-list">
              <div v-for="action in currentEmotion.improvementSuggestions" :key="action" class="action-item">
                <div class="action-icon">✨</div>
                <div class="action-text">{{ action }}</div>
              </div>
            </div>
          </div>
          <!-- 风险提示 -->
          <div class="risk-notice" v-if="currentEmotion.riskLevel > 1 && currentEmotion.isNegative">
            <div class="notice-icon"> 🤗</div>
            <div class="notice-content">
              <div class="notice-title">风险提示</div>
              <div class="notice-text">
                {{ currentEmotion.riskDescription }}
              </div>
            </div>

          </div>

        </div>
      </div>
      <!-- 会话列表 -->
      <div class="session-history">
        <h4>会话列表</h4>
        <div class="session-list">
          <div
            :class="['session-item', (currentSession && (currentSession.id === session.id || currentSession.sessionId === session.sessionId)) ? 'active' : '']"
            v-for="session in sessionList" :key="session.id || session.sessionId" @click="handleSessionClick(session)">
            <div class="session-info">
              <div class="session-title">{{ session.sessionTitle }}</div>
              <div class="session-actions">
                <el-button text type="danger" size="small"
                  @click.stop="handleDeleteSession(session.id || session.sessionId)">
                  <el-icon>
                    <DeleteFilled />
                  </el-icon>
                </el-button>
              </div>
              <div class="session-meta">
                <div class="session-time">
                  <span>{{ session.createdAt || session.lastMessageTime }}</span>
                </div>
                <div class="session-preview">
                  <p>{{ session.lastChatMessageContent || session.lastMessageContent }}</p>
                </div>
                <div class="session-status">
                  <span>
                    <el-icon>
                      <ChatRound />
                    </el-icon>
                    {{ session.messageCount || 0 }}
                  </span>
                  <span>
                    <el-icon>
                      <Clock />
                    </el-icon>
                    {{ session.durationMinutes || 0 }}分钟
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <!-- 会话区域 -->
    <div class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="likeUrl" style="width: 24px; height: 24px; " />
          </div>
          <div class="chat-info">
            <h2>宁渡AI助手</h2>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>
        <el-button class="add-btn" circle @click="createNewFrontendChat" title="新建会话">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>
      <!-- 聊天消息区域 -->
      <div class="chat-messages">
        <div class="message-item ai-message" v-if="messages.length === 0">
          <div class="message-avatar">
            <el-image :src="iconUrl" style="width: 18px ; height: 18px; " alt="心理助手图标" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>你好，我是心理助手，我可以帮助你解决心理问题。</p>
            </div>
            <div class="message-time">
              刚刚
            </div>
          </div>
        </div>
        <div v-for="msg in messages" :key="msg.id || msg.createdAt + msg.senderType"
          :class="['message-item', msg.senderType === 1 ? 'user-message' : 'ai-message']">
          <div class="message-avatar">
            <el-image v-if="msg.senderType === 2" :src="iconUrl" style="width: 18px ; height: 18px; "></el-image>
            <el-image v-if="msg.senderType === 1" :src="likeUrl" style="width: 18px ; height: 18px; "></el-image>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <div v-if="msg.senderType === 2 && aiTyping && !msg.content" class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <!-- AI错误提示 -->
              <div v-else-if="msg.isError" class="error-message">
                <p>{{ msg.content }}</p>
              </div>
              <!-- AI正常回复 -->
              <MarkdownRenderer v-else-if="msg.senderType === 2 && !msg.isError" :content="msg.content"
                :is-ai-message="true" />
              <p v-else-if="msg.content" v-html="formatMessage(msg.content)"></p>
            </div>
            <div class="message-time">
              {{ msg.senderType === 2 && aiTyping ? '正在输入...' : msg.createdAt }}
            </div>
          </div>
        </div>
      </div>
      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input v-model="inputMessage" placeholder="请输入" type="textarea" :rows="10" clearable :disabled="aiTyping"
            @keydown="handleKeyDownEvent" />
          <div class="input-footer">
            <span>按Enter发送,Shift+Enter换行</span>
            <span>{{ inputMessage.length }}/500</span>
          </div>
        </div>
        <el-button :disabled="!inputMessage.trim() || inputMessage.length > 500" class="send-btn" type="primary"
          @click="sendMessage">
          <el-icon>
            <Promotion />
          </el-icon>
        </el-button>

      </div>
    </div>
  </div>
</template>
<script setup>
import { ChatRound, Clock, Promotion, DeleteFilled, Plus } from '@element-plus/icons-vue';
import { ref, onMounted } from 'vue';
import { getSessionHistory, startNewSessionApi, deleteSession, getSessionDetail, getSessionEmotionAnalysis } from '@/api/frontend'
import { ElMessage } from 'element-plus';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import { fetchEventSource } from '@microsoft/fetch-event-source'

const iconUrl = new URL('../assets/robot-fill.png', import.meta.url).href
const likeUrl = new URL('../assets/like.png', import.meta.url).href
//情绪花园
const currentEmotion = ref({
  primaryEmotion: '',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  riskDescription: '',
  suggestion: '情绪状态平稳',
  improvementSuggestions: []
})
//映射方法
const getIntensityClass = (score) => {
  if (score >= 61) return 3
  if (score >= 31) return 2
  return 1

}

const getRiskText = (level) => {
  switch (level) {
    case 0:
      return '正常'
    case 1:
      return '关注'
    case 2:
      return '预警'
    case 3:
      return '风险'
    default:
      return '正常'
  }
}


//获取当前会话
const currentSession = ref(null)
const sessionList = ref([])
//定义对话消息
const messages = ref([])
//定义输入消息
const inputMessage = ref('')
//定义AI是否正在输入
const aiTyping = ref(false)
//定义对话消息数据
const messageData = ref([])

//新建会话
const createNewSession = () => {
  const newSession = {
    sessionId: `temp_${Date.now()}`,
    status: 'TEMP',
    sessionTitle: '新对话'
  }
  currentSession.value = newSession
  messages.value = []
}
//获取会话情绪分析结果
const loadSessionEmotion = (sessionId) => {
  const id = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
  getSessionEmotionAnalysis(id).then(res => {
    if (res.code == 200) {
      console.log(res.data)
      currentEmotion.value = res.data
    }
  })
}

const createNewFrontendChat = () => {
  createNewSession()
}
// 定义键盘事件处理函数
const handleKeyDownEvent = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
// 定义发送消息方法
const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  //状态信息
  if (aiTyping.value) {
    ElMessage.error('请稍后再发送')
    return
  }
  const message = inputMessage.value.trim()

  // 添加用户消息到界面
  const userMsg = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    content: message,
    senderType: 1,
    createdAt: new Date().toLocaleString()
  }
  messages.value.push(userMsg)
  inputMessage.value = ''

  //如果是临时会话，再创建新的会话
  if (currentSession.value.status === 'TEMP') {
    startNewSession(message)
  } else {
    // 如果是现有会话，继续对话
    continueSession(message)
  }
}

const continueSession = (message) => {
  const sessionId = currentSession.value.sessionId || currentSession.value.id
  if (!sessionId || String(sessionId).startsWith('temp_')) {
    ElMessage.error('会话无效，请重新选择或新建会话')
    return
  }
  startAIRespons(sessionId, message)
}

const startNewSession = (message) => {
  const sessionParams = {
    initialMessage: message
  }
  if (currentSession.value.sessionTitle === '新对话') {
    sessionParams.sessionTitle = `宁渡心理助手-${new Date().toLocaleString()}`
  } else {
    sessionParams.sessionTitle = currentSession.value.sessionTitle
  }

  aiTyping.value = true
  //调接口
  startNewSessionApi(sessionParams).then(res => {
    aiTyping.value = false
    if (res.code == 200) {
      const sessionData = {
        id: res.data.id || res.data.sessionId,
        sessionId: res.data.sessionId || res.data.id,
        sessionTitle: sessionParams.sessionTitle,
        status: res.data.status
      }
      //更新为正式对话
      currentSession.value = sessionData

      //获取会话历史列表（消息由流式接口实时渲染，避免 loadMessages 覆盖流式内容）
      getSessionHistoryList()
      startAIRespons(currentSession.value.sessionId, message)

    } else {
      ElMessage.error(res.msg || '开启会话失败')
    }
  }).catch(() => {
    aiTyping.value = false
    ElMessage.error('开启会话失败，请检查网络')
  })
}
/** 合并流式片段：支持后端发「增量」或「全量累积」两种格式 */
const mergeStreamChunk = (current, chunk) => {
  if (!chunk) return current
  if (!current) return chunk
  if (chunk === current) return current
  if (chunk.startsWith(current)) return chunk
  if (current.endsWith(chunk)) return current
  return current + chunk
}

const startAIRespons = (sessionId, inputMessage) => {
  if (aiTyping.value) {
    ElMessage.error('请稍后再发送')
    return
  }
  aiTyping.value = true
  const aiMessageId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const aiMessage = {
    id: aiMessageId,
    content: "",
    senderType: 2,
    createdAt: new Date().toLocaleString()
  }
  messages.value.push(aiMessage)
  //调用接口
  //停止之前的请求
  const ctrl = new AbortController()
  fetchEventSource('/api/psychological-chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': localStorage.getItem('token') || '',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({
      sessionId: sessionId,
      userMessage: inputMessage
    }),
    signal: ctrl.signal,
    onopen: async (response) => {
      const contentType = response.headers.get('content-type') || ''
      if (response.ok && contentType.includes('text/event-stream')) {
        return
      }
      const errText = await response.text().catch(() => '')
      throw new Error(errText || `流式连接失败 (${response.status})`)
    },
    onmessage: (event) => {
      const row = event.data.trim()
      if (!row) return
      const eventName = event.event

      if (eventName === 'done') {
        aiTyping.value = false
        ctrl.abort()
        getSessionHistoryList()
        loadMessages(sessionId)
        // 加载会话情绪分析结果
        loadSessionEmotion(sessionId)
        return
      }
      const payload = JSON.parse(row)
      const ok = String(payload.code) === '200'
      const chunk = payload.data?.content ?? payload.data?.delta ?? ''
      if (ok && chunk) {
        const idx = messages.value.findIndex(m => m.id === aiMessageId)
        if (idx === -1) return
        const prev = messages.value[idx].content || ''
        messages.value[idx] = {
          ...messages.value[idx],
          content: mergeStreamChunk(prev, chunk)
        }
      } else if (!ok) {
        handleError(payload.message || payload.msg || '服务器返回错误')
      }
    },
    //错误
    onError: (error) => {
      handleError(error)
    },
    //关闭
    onClose: () => {
      loadSessionEmotion(sessionId)
      ctrl.abort()
    }

  })

}
//错误处理函数
const handleError = (error) => {
  const msg = typeof error === 'string' ? error : (error?.message || '发送失败')
  const aiMessage = messages.value[messages.value.length - 1]
  if (aiMessage && aiMessage.senderType === 2) {
    aiMessage.content = 'AI 回复失败，请稍后重试'
    aiMessage.isError = true
  }
  aiTyping.value = false
  ElMessage.error(msg)
}

const loadMessages = (sessionId) => {
  if (!sessionId) return
  getSessionDetail(sessionId).then(res => {
    if (res.code == 200) {
      // 兼容两种返回格式：直接返回数组或返回分页对象
      messages.value = Array.isArray(res.data) ? res.data : (res.data.records || [])
      // 加载会话情绪分析结果
      loadSessionEmotion(sessionId)
    }
  })
}

const getSessionHistoryList = () => {
  getSessionHistory({
    pageNum: 1,
    pageSize: 50
  }).then(res => {
    if (res.code == 200) {
      sessionList.value = res.data.records || []
      console.log('会话历史列表加载成功:', sessionList.value)
    }
  })
}
//获取会话数据
const handleSessionClick = (session) => {
  const sessionId = session.sessionId || session.id
  currentSession.value = {
    id: session.id,
    sessionId,
    status: session.status || 'ACTIVE',
    sessionTitle: session.sessionTitle
  }
  loadMessages(sessionId)
}
const handleDeleteSession = (sessionId) => {
  deleteSession(sessionId).then(res => {
    if (res.code == 200) {
      ElMessage.success('删除成功')
      // 刷新会话列表
      getSessionHistoryList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  })
}
const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}
onMounted(() => {
  createNewSession()
  getSessionHistoryList()
})
</script>
<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  align-items: stretch;
  gap: 20px;
  padding: 20px;

  .sidebar {
    width: 320px;

    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }

      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }

      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;

        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }

    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 12px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

      }

      .session-list {
        max-height: 320px;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(64, 150, 255, 0.35);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;

          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }

          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }

          .session-info {
            flex: 1;

            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .session-meta {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-bottom: 6px;

              .session-time {
                font-size: 12px;
                color: #999;
              }

              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .session-status {
                display: flex;
                align-items: center;
                gap: 12px;

                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }

            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }

        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }

    .emotion-garden {
      background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;

        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }

      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #fff;

        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }

        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }

      .warm-tips {
        text-align: center;
        margin-bottom: 16px;

        .emotion-status-text {
          margin-bottom: 12px;

          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }

          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;

            &.negative {
              background: #fee2e2;
              color: #ef4444;
            }

            &.positive {
              background: #d1fae5;
              color: #10b981;
            }
          }
        }

        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .intensity-dots {
            display: flex;
            gap: 4px;

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;

              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }

          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }

        .warm-suggestion {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .suggestion-content {
            text-align: left;
            flex: 1;

            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }

            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }

        .healing-actions {
          margin-bottom: 16px;

          .action-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }

          .action-list {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .action-item {
              background: #ffffff;
              border-radius: 20px;
              padding: 10px 16px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(139, 115, 85, 0.1);
              box-shadow: 0 4px 15px rgba(139, 115, 85, 0.05);
              text-align: left;
              transition: transform 0.2s ease;

              &:hover {
                transform: translateY(-2px);
              }

              .action-icon {
                font-size: 16px;
                color: #eab308;
                flex-shrink: 0;
              }

              .action-text {
                font-size: 13px;
                color: #8b7355;
                font-weight: 500;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }

        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);

          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .notice-content {
            flex: 1;

            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }

            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }

  .chat-main {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    align-self: stretch;

    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;

      .header-left {
        display: flex;
        align-items: center;

        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }

        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          p {
            font-size: 14px;
          }
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
      min-height: 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;

      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }

        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
          }
        }

        &.user-message {
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }

        .message-content {
          max-width: 70%;

          .message-bubble {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;

              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;

                &:nth-child(2) {
                  animation-delay: 0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }

            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
              border: 1px solid #F87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991B1B;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }

          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }

    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 248, 0.98) 100%);
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      margin-top: auto;

      .input-container {
        flex: 1;
      }

      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
      }

      .send-btn {
        height: 60px;
        width: 60px;
        border-radius: 16px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s ease;
      }

    }

  }
}
</style>