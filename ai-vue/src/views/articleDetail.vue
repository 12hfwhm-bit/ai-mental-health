<template>
  <div class="articleDetail-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="bookUrl" style="width: 60px; height: 60px;"></el-image>
        <h1>知识文章详情</h1>
      </div>
    </div>
    <div class="content">
      <div class="diary-card">
        <p class="title">文章信息</p>
        <div class="sub-title">
          <el-tag class="category-tag" size="large">{{ articleDetail.categoryName }}</el-tag>
          <div class="flex-box">
            <el-icon>
              <List />
            </el-icon>
            <span>{{ dayjs(articleDetail.publishAt || articleDetail.updatedAt ||
              articleDetail.updateAt).format('YYYY-MM-DD')
              }}</span>
          </div>
        </div>
        <!-- 正文信息 -->
        <h1 class="article-title">{{ articleDetail.title }}</h1>
        <div class="summary-content" v-if="articleDetail.summary">
          <p>{{ articleDetail.summary }}</p>
        </div>
        <div :style="{ marginTop: '20px' }" class="flex-box">
          <div class="flex-box item">
            <el-icon>
              <Avatar />
            </el-icon>
            <span>{{ articleDetail.authorName }}</span>
          </div>
          <div class="flex-box item">
            <el-icon>
              <Platform />
            </el-icon>
            <span>{{ articleDetail.readCount }} 人阅读</span>
          </div>
        </div>
      </div>
      <!-- 正文 -->
      <div class="diary-card">
        <div class="title">文章内容</div>
        <div class="content-wrapper">
          <div v-html="formatContent(articleDetail.content)"></div>
        </div>
        <div class="tags-content" v-if="articleDetail.tagArray && articleDetail.tagArray.length">
          <h4>相关标签</h4>
          <div class="tags-list">
            <el-tag v-for="tag in articleDetail.tagArray" :key="tag" :type="getTagType(tag)" effect="light"
              class="tag-item">
              {{ getTagName(tag) }}
            </el-tag>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>
<script setup>
import { getArticleDetail } from '@/api/frontend'
import { List, Avatar } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const articleDetail = ref({})
const bookUrl = new URL('../assets/book.png', import.meta.url).href

// 情绪类型与样式的映射
const emotionTypes = {
  '快乐': 'success',
  '平静': 'info',
  '兴奋': 'warning',
  '愤怒': 'danger',
  '悲伤': 'info',
  '焦虑': 'warning'
}

// 英文标签到中文标签的兼容映射
const englishToChineseMap = {
  'success': '快乐',
  'info': '平静',
  'warning': '兴奋',
  'danger': '愤怒'
}

// 获取标签显示的文本
const getTagName = (tag) => {
  return englishToChineseMap[tag] || tag
}

// 获取标签的样式类型
const getTagType = (tag) => {
  // 如果是中文标签，直接查 emotionTypes
  if (emotionTypes[tag]) return emotionTypes[tag]
  // 如果是英文标签，先转中文再查，或者直接返回 tag (如果 tag 本身就是 success/info 等)
  const types = ['success', 'info', 'warning', 'danger', 'primary']
  if (types.includes(tag)) return tag
  return 'primary'
}

const props = defineProps({
  id: String
})
const articleId = ref({})
onMounted(() => {
  console.log(props);

  getArticleDetail(props.id).then(res => {
    const data = res.data || {}
    // 兼容处理：如果后端没返回 tagArray，尝试从 tags 字符串解析
    if (!data.tagArray && data.tags) {
      data.tagArray = data.tags.split(',').filter(t => t.trim())
    }
    articleDetail.value = data
  })
})
const formatContent = (content) => {
  if (!content) return ''

  // 基本的HTML清理和格式化
  let formatted = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')

  return formatted
}


</script>

<style scoped lang="scss">
.articleDetail-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .flex-box {
    display: flex;
    align-items: center;

    .item {
      margin-right: 20px;

      span {
        margin-left: 5px;
      }
    }
  }

  .header-section {
    background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
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
        margin-bottom: 15px;
        font-size: 20px;
        font-weight: 600;
        color: #374151;
      }

      .sub-title {
        margin-top: 20px;
        display: flex;
        align-items: center;

        .category-tag {
          margin-right: 20px;
        }
      }

      .article-title {
        font-size: 28px;
        font-weight: bold;
        color: #111827;
        margin-top: 30px;
        margin-bottom: 10px;
      }

      .summary-content {
        background: rgba(126, 211, 33, 0.1);
        border-left: 4px solid #7ED321;
        padding: 10px 15px;
        border-radius: 0 8px 8px 0;
        position: relative;
      }

      .content-wrapper {
        font-size: 15px;
        color: #374151;

        :deep(p) {
          margin-bottom: 10px;
        }

        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin: 15px 0 10px;
          color: #111827;
          font-weight: 600;
        }

        :deep(h2) {
          font-size: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
        }

        :deep(h3) {
          font-size: 13px;
        }

        :deep(ul),
        :deep(ol) {
          padding-left: 15px;
          margin-bottom: 10px;
        }

        :deep(li) {
          margin-bottom: 5px;
        }
      }

      .tags-content {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;

        .tags-title {
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
      }
    }
  }
}
</style>
