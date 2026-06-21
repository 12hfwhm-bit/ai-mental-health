<template>
  <el-dialog :title="isedit ? '编辑文章' : '新增文章'" v-model="dialogVisible" width="50%" @close="handleClose">
    <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="50" show-word-limit clearable />
      </el-form-item>

      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择所属分类">
          <el-option v-for="item in props.res.categoryList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="文章内容" prop="summary">
        <el-input v-model="formData.summary" type="textarea" placeholder="请输入文章内容" maxlength="2000" show-word-limit
          clearable :rows="4" />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select v-model="formData.tags" placeholder="请选择文章标签" multiple filterable allow-create width="100%">
          <el-option v-for="(type, label) in emotionTypes" :key="label" :label="label" :value="label" />
        </el-select>
      </el-form-item>

      <el-form-item label="封面" prop="coverImg">
        <!-- 1. 直接在最外层加一个带边框的 div，最容易理解 -->
        <div class="upload-box">
          <el-upload action="#" :show-file-list="false" accept="image/*" :before-upload="beforeUpload"
            :http-request="handleUpload">
            <!-- 2. 有图显示图，没图显示文字，逻辑清晰 -->
            <img v-if="imgUrl" :src="imgUrl" class="cover-img">
            <div v-else class="cover-placeholder">
              <span>点击上传封面</span>
            </div>
          </el-upload>
          <div v-if="imgUrl" class="cover-romve">
            <el-button type="danger" size="small" @click="handleRemove">移除封面</el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 文章文本编辑器 -->
      <el-form-item label="文章内容" prop="content">
        <RichTextEditor v-model="formData.content" placeholder="请输入文章内容" :maxCharCount="2000" @change="handleChange"
          @handleEditorCreated="handleEditorCreated" min-height="400px" />
      </el-form-item>

    </el-form>

    <!-- 预览按钮组 -->
    <div v-if="btnPreview">
      <h3>预览文章</h3>
      <div v-html="formData.content"></div>
    </div>
    <template #footer>
      <el-button type="primary" @click="btnPreview = !btnPreview"> {{ btnPreview ? '隐藏预览' : '预览结果' }}</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">{{ isedit ? '更新' : '创建' }}</el-button>
      <el-button type="primary" @click="handleClose">取消</el-button>
    </template>


  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, watch } from 'vue'
import { uploadFile, createArticle, updateArticle } from '@/api/admin'
import { ElMessage } from 'element-plus'
import { getFileUrl, extractFilePath, getArticleCover, normalizeCoverForSave } from '../config/index.js'
import RichTextEditor from '../components/RichTextEditor.vue'
//defineProps 子组件首先要声明它愿意接收哪些数据
const props = defineProps({
  modelValue: {// 对应父组件的 v-model:modelValue，控制弹窗开关
    type: Boolean,
    default: false
  },
  res: {// 对应父组件的 :res，包含分类列表数据
    type: Object,
    default: () => ({})
  },
  article: { // 对应父组件的 :article，当前编辑的文章对象
    type: Object,
    default: null
  }
})
const emit = defineEmits(['update:modelValue', 'success'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// --- 1. 变量定义放在最前面 ---
const formRef = ref(null)
const loading = ref(false)
const btnPreview = ref(false)
const imgUrl = ref('')
const businessId = ref('')
const editorRef = ref<any>(null)

// 表单数据
const formData = reactive({
  "title": "",
  "content": "",
  "coverImg": "",
  "categoryId": undefined,
  "summary": "",
  "tags": [] as string[],
  "id": ""
})

const emotionTypes = {
  '快乐': 'success',
  '平静': 'info',
  '兴奋': 'warning',
  '愤怒': 'danger',
  '悲伤': 'info',
  '焦虑': 'warning'
}

// --- 2. 逻辑判断 ---
const isedit = computed(() => !!props.article?.id)

// 监听 props.article 变化，用于编辑模式回显数据
watch(() => props.article, (newVal) => {
  if (newVal) {
    // 编辑模式：填充数据
    const { tags, ...rest } = newVal
    Object.assign(formData, rest)

    // 处理标签：如果是字符串则切分，并进行中英文兼容处理
    let tagList = typeof tags === 'string' ? (tags ? tags.split(',') : []) : (tags || [])

    // 兼容旧数据的英文标签，转换为中文
    const englishToChineseMap = {
      'success': '快乐',
      'info': '平静',
      'warning': '兴奋',
      'danger': '愤怒'
    }
    formData.tags = tagList.map(tag => englishToChineseMap[tag] || tag)

    businessId.value = newVal.id
    const cover = getArticleCover(newVal)
    imgUrl.value = getFileUrl(cover)
    formData.coverImg = normalizeCoverForSave(cover)

    if (editorRef.value) {
      editorRef.value.setHtml(newVal.content || '')
    }
  } else {
    // 新增模式：重置数据
    Object.assign(formData, {
      "title": "",
      "content": "",
      "coverImg": "",
      "categoryId": undefined,
      "summary": "",
      "tags": [],
      "id": ""
    })
    imgUrl.value = ''
    businessId.value = ''
    if (editorRef.value) {
      editorRef.value.setHtml('')
    }
  }
}, { immediate: true })

// --- 4. 方法定义 ---
const handleClose = () => {
  formRef.value.resetFields()
  businessId.value = ''
  formData.tags = []
  handleRemove()
  if (editorRef.value) {
    editorRef.value.setHtml('')
  }
  emit('update:modelValue', false)
}
//上传封面前的校验函数
const beforeUpload = (file: any) => {
  const isImage = file.type.startsWith('image/')
  const isLimit = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('请上传图片文件');
    return false;
  }
  if (!isLimit) {
    ElMessage.error('图片大小不能超过2MB');
    return false;
  }
  return true;
}

//上传封面
const handleUpload = async (options: any) => {
  try {
    const { file } = options
    businessId.value = crypto.randomUUID()
    const fileRes = await uploadFile(file, { businessId: businessId.value })
    if (fileRes.code == 200) {
      const path = extractFilePath(fileRes.data)
      formData.coverImg = path
      imgUrl.value = getFileUrl(path)
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(fileRes.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传出错:', error)
    ElMessage.error('上传出错，请稍后重试')
  }
}

//移除封面
const handleRemove = () => {
  imgUrl.value = ''
  formData.coverImg = ''
}

// 文章内容改变时触发
const handleChange = (val: any) => {
  formData.content = val.html
}
// 文章内容改变时触发，设置编辑器内容
const handleEditorCreated = (editor: any) => {
  editorRef.value = editor
  if (formData.content && editor) {
    nextTick(() => {
      editor.setHtml(formData.content)
    })
  }
}

// 表单校验规则
const rules = reactive({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { max: 50, message: '文章标题最多50个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择文章分类', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { max: 2000, message: '文章内容最多2000个字符', trigger: 'blur' },
  ]
})

//提交
const handleSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const submitData = {
          ...formData,
          tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags
        }

        // 根据 isedit 决定调用新增还是更新接口
        let res: any;
        if (isedit.value) {
          res = await updateArticle(formData.id, submitData)
        } else {
          res = await createArticle(submitData)
        }

        if (res.code == 200) {
          ElMessage.success(isedit.value ? '更新成功' : '发布成功')
          dialogVisible.value = false
          emit('success')
        } else {
          ElMessage.error(res.msg || (isedit.value ? '更新失败' : '发布失败'))
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('操作失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
<style scoped lang="scss">
.cover-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #909399;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.cover-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
}
</style>
