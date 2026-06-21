
import service from '../utils/request'

export function login(data) {
  return service.post('/user/login', data)
}

export function categoryType() {
  return service.get('/knowledge/category/tree')
}
export function articlePage(params) {
  return service.get('/knowledge/article/page', { params })
}

export function uploadFile(file, businessInfo) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('businessType', 'ARTICLE')
  formData.append('businessId', businessInfo.businessId)
  formData.append('businessField', 'cover')
  return service.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

}

export function createArticle(data) {
  return service.post('/knowledge/article', data)
}

//获取文章详情
export function getarticleDetail(id) {
  return service.get(`/knowledge/article/${id}`)
}
//更新文章
export function updateArticle(id, data) {
  return service.put(`/knowledge/article/${id}`, data)
}

//更新文章状态
export function updateArticleStatus(id, data) {
  return service.put(`/knowledge/article/${id}/status`, data)
}
//删除
export function deleteArticle(id) {
  return service.delete(`/knowledge/article/${id}`)
}

//获取咨询记录
export function getConsultations(params) {
  return service.get('/psychological-chat/sessions', { params })
}

export function getSessionDetail(sessionId) {
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

//获取情绪日志
export function getEmotionalLogs(params) {
  return service.get('/emotion-diary/admin/page', { params })

}
//删除情绪日志
export function deleteEmotionalLog(id) {
  return service.delete(`/emotion-diary/admin/${id}`)
}
//获取综合数据
export function getAnalyticsOverview() {
  return service.get('/data-analytics/overview')
}
//退出登录
export function logout() {
  return service.post('/user/logout')
}

