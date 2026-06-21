<template>
  <div class="knowledge-page">
    <div class="main-card">
      <PageHead title="知识文章">
        <template #buttons>
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button type="primary">删除</el-button>
        </template>
      </PageHead>
      <TableSearch :formItem="formItem" @search="handleSearch" />
      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        style="width: 100%"
         margin-top="25px"
      >
 
        <el-table-column prop="title" label="文章标题" fixed="left">
        <template #default="scope">
          <div style="display: flex; align-items:center;"  >
             <el-icon> <timer/></el-icon>
             <span>{{scope.row.title}}</span>
          </div>
        </template>
        
        </el-table-column>
     
       <el-table-column prop="categoryId" label="分类" width="200">
        <template #default="scope">
          <div style="display: flex; align-items:center;"  >
             <el-icon> <timer/></el-icon>
             <span>{{categoryMap[scope.row.categoryId] || '无'}}</span>
          </div>
        </template>
        </el-table-column>

     <el-table-column prop="authorName" label="作者" width="200"></el-table-column>
        <el-table-column prop="readCount" label="阅读量" width="200"></el-table-column>
        <el-table-column prop="updatedAt" label="发布时间" width="200"></el-table-column>
         
       <el-table-column label="状态" width="250" fixed="right">
        <template #default="scope">
          <el-button  @click="handleEdit(scope.row)" link type="primary"> 编辑</el-button>
          <el-button  @click="handleOffline(scope.row)" v-if="scope.row.status === 1" link type="warning"> 下线</el-button>
          <el-button @click="handlePublish(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 2" link type="success"> 发布</el-button>
          <el-button  @click="handleDelete(scope.row)" link type="danger"> 删除</el-button>
        </template>
       </el-table-column>

      </el-table>
          <el-pagination 
         style="margin-top: 25px"
          :page-size="pageParams.size"
          layout="prev, pager, next" :total="pageParams.total" 
          @current-change="handleCurrentChange"
          />
          <ArticleDialog v-model:modelValue="dialogVisible" :article="currentArticle" :res="dialogRes" @success="handleSuccess"   />
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHead from '../components/PageHead.vue'
import TableSearch from '../components/TableSearch.vue';
import { articlePage, categoryType,updateArticleStatus ,deleteArticle} from '../api/admin';
import { onMounted, reactive, ref } from 'vue';
import ArticleDialog from '../components/ArticleDialog.vue';
import { getarticleDetail } from '../api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
 // 弹窗显示状态
const dialogVisible = ref(false)
//列表数据
const tableData =ref([])

// 传递给弹窗的数据
const dialogRes = reactive({
  categoryList: []
})


const formItem: any = reactive([
  {
    comp: 'input', prop: 'title', label: '文章标题', placeholder: '请输入文章标题'
  },
  {
    comp: 'select', prop: 'type', label: '文章类型', placeholder: '请选择文章类型',
    options: []
  },
  {
    comp: 'select', prop: 'status', label: '状态', placeholder: '请选择状态', options: [
      { label: '正常', value: 0 },
      { label: '已发布', value: 1 },
      { label: '已下载', value: 2 }
    ]
  }
])
// 分页参数
const pageParams = reactive({
  currentPage: 1,
  size: 10,
  total: 0
})



// 搜索方法,回调函数，formData为搜索表单数据对象，获取表单数据
const handleSearch = async (formData: any = {}) => {
  console.log('搜索参数:', formData);

  const params = {
    ...pageParams,
    ...formData
  }

  try {
    const res: any = await articlePage(params)
    console.log(res, '文章列表分页响应');
    
    // 使用 == 兼容字符串 "200"
    if (res.code == 200) {
      // 核心修复：从 res.data 中提取 records 和 total
      tableData.value = res.data?.records || []
      pageParams.total = res.data?.total || 0
  
      console.log('列表数据已更新:', tableData.value);
    }
  } catch (error) {
    console.error('获取文章列表失败', error)
  }
}

// 获取文章类型
const categoryMap: any = reactive({})
onMounted(async () => {
  try {
    const res: any = await categoryType()
    console.log(res, '分类树');

    // 使用 == 兼容字符串 "200"
    if (res.code == 200 && Array.isArray(res.data)) {
      const options = res.data.map((item: any) => {
        categoryMap[item.id] = item.categoryName
        return {
          label: item.categoryName,
          value: item.id
        }
      })
      // 遍历 formItem 找到 type 项并赋值，确保响应式
      formItem.forEach((item: any) => {
        if (item.prop === 'type') {
          item.options = options
        }
      })
      // 更新弹窗所需的分类列表
      dialogRes.categoryList = res.data.map((item: any) => ({
        id: item.id,
        name: item.categoryName
      }))
      console.log('分类数据已注入 formItem:', formItem)
    }
    handleSearch()
  } catch (error) {
    console.error('获取分类失败', error)
  }
})
// 分页方法
const handleCurrentChange = (val: number) => {
  pageParams.currentPage = val
  handleSearch()
}
// 创建成功后刷新列表
const handleSuccess = () => {
  handleSearch()
}
// 当前文章详情
const currentArticle = ref(null)

 // 编辑文章
const handleEdit = (row: any) => {
  if(!row.id) return
  getarticleDetail(row.id).then((res: any) => {
      // 这里的 res 通常是 { code: 200, data: {...}, msg: "" }
      // 需要把 res.data 赋值给 currentArticle，否则里面没有 id，弹窗就判断不出是编辑模式
      currentArticle.value = res.data 
      dialogVisible.value = true
  })
}

 // 新增文章
const handleAdd = () => {
  currentArticle.value = null
  dialogVisible.value = true
}

//发布
const handlePublish=(row)=>{
ElMessageBox.confirm(
  `确认发布${row.title}吗？`,
  '确认',
  {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }
).then(()=>{
  updateArticleStatus(row.id,{status:1}).then(res=>{
    ElMessage.success('发布成功')
    handleSearch()
  })
})

}
//下线
const handleOffline=(row)=>{
ElMessageBox.confirm(
  `确认下线${row.title}吗？`,
  '确认',
  {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }
).then(()=>{
  updateArticleStatus(row.id,{status:2}).then((res: any)=>{
    if (res.code == 200) {
      ElMessage.success('下线成功')
      handleSearch()
    }
  })
})}

//删除
const handleDelete=(row)=>{
ElMessageBox.confirm(
  `确认删除${row.title}吗？`,
  '确认',
  {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }
).then(()=>{
  deleteArticle(row.id).then((res: any)=>{
    if (res.code == 200) {
      ElMessage.success('删除成功')
      handleSearch()
    }
  })
})}



</script>

 
