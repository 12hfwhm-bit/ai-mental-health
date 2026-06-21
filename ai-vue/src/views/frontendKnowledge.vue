<template>
  <div class="knowledge-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="bookUrl" style="width: 60px; height: 60px;" alt="logo" />
        <h1>心理健康知识库</h1>
      </div>
    </div>
    <!-- 左侧菜单 -->
    <div class="content">
      <div class="recommend-section">
        <h2 class="section-title">推荐文章</h2>
        <div class="recommend-list">
          <div v-for="item in articleList" :key="item.id" class="recommend-item" @click="goToArticle(item.id)">
            <h4>{{ item.title }}</h4>
            <p class="read-count">
              <el-icon>
                <Histogram />
              </el-icon>
              阅读量：{{ item.readCount }}

            </p>
          </div>
        </div>
      </div>
      <!-- 右侧文章列表 -->
      <div class="article-list">
        <div v-for="item in rightList" :key="item.id" class="article-item" @click="goToArticle(item.id)">
          <el-image style="width: 240px; height: 150px;" fit="cover" alt="文章封面"
            :src="getImage(getArticleCover(item))"></el-image>
          <div class="info">
            <div class="title">
              <h3>{{ item.title }}</h3>
            </div>
            <el-tag Plain type="primary">{{ item.categoryName }}</el-tag>
          </div>
          <div :style="{ marginTop: '10px' }">
            <div class="flex-box">
              <el-icon>
                <Avatar />
              </el-icon>
              <span>{{ item.authorName }}</span>
            </div>
            <div class="flex-box">
              <el-icon>
                <List />
              </el-icon>
              <span>{{ dayjs(item.publishAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </div>
          </div>

          <div :style="{ marginTop: '10px' }">
            <div class="flex-box">
              <el-icon>
                <Platform />
              </el-icon>
              <span> 观看人数：{{ item.readCount }}</span>
            </div>

          </div>
        </div>
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="pagination.currentPage" :page-size="pagination.size"
            :total="pagination.total" layout="total, prev, pager, next" background @current-change="handlePageChange" />
        </div>
      </div>

    </div>


  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue'
import dayjs from 'dayjs'
import { Avatar, List, Platform, Histogram } from '@element-plus/icons-vue'
import { getArticleList } from '@/api/frontend'
import { useRouter } from 'vue-router'
import { getFileUrl, getArticleCover } from '@/config/index.js'
const router = useRouter()

const bookUrl = new URL('../assets/book.png', import.meta.url).href
//获取文章列表的参数
const articleList = ref([])
//右侧文章列表的参数
const pagination = reactive({
  currentPage: 1,
  size: 10,
  total: 0
})
const rightList = ref([])
//获取列表数据
const getPagelist = () => {
  const params = {
    sortField: 'publishAt',
    sortDirection: 'desc',
    currentPage: pagination.currentPage,
    size: pagination.size
  }
  getArticleList(params).then(res => {
    rightList.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  })
}

const handlePageChange = (page) => {
  pagination.currentPage = page
  getPagelist()
}
//跳转文章详情页
const goToArticle = (id) => {
  router.push(`/knowledge/article/${id}`)
}



const DEFAULT_COVER = 'https://file.itndedu.com/psychology_ai.png'
const getImage = (url) => getFileUrl(url, DEFAULT_COVER)
onMounted(() => {
  const params = {
    sortField: 'readCount',
    sortDirection: 'desc',
    currentPage: 1,
    size: 5
  }
  getPagelist()
  getArticleList(params).then(res => {
    articleList.value = res.data?.records || []
  })
})

</script>


<style scoped lang="scss">
.knowledge-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .flex-box {
    display: flex;
    align-items: center;

    span {
      margin-left: 10px;
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
    display: flex;
    gap: 20px;
    margin: 0 auto;
    width: 1200px;
    padding: 20px;

    .recommend-section {
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 15px;
      height: 400px;

      .section-title {
        font-size: 12;
        font-weight: 600;
        color: #374151;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .recommend-item {
          border-left: 4px solid #f59e0b;
          padding-left: 10px;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #fffbeb;
          }

          .read-count {
            margin-top: 15px;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }

    .article-list {
      flex: 1;

      .pagination-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 10px;
        padding-bottom: 10px;
      }

      .article-item {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        padding: 15px;
        margin-bottom: 20px;
        display: flex;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .info {
          margin-left: 20px;

          .title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }
  }

}
</style>
