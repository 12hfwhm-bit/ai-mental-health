import service from '@/utils/request'

//注册
export const register = (data) => {
  return service.post('/user/add', data)
}
//创建新的会话
export const startNewSessionApi = (data) => {
  return service.post('/psychological-chat/session/start', data)
}
//分页查询咨询会话
export const getSessionHistory = (params) => {
  return service.get('/psychological-chat/sessions', { params })
}
//删除会话
export const deleteSession = (sessionId) => {
  return service.delete(`/psychological-chat/sessions/${sessionId}`)
}
//消息列表详情
export const getSessionDetail = (sessionId) => {
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}
//获取会话情绪分析结果
export const getSessionEmotionAnalysis = (sessionId) => {
  return service.get(`/psychological-chat/session/${sessionId}/emotion`)
}
//提交情绪日记
export const submitEmotionDiary = (data) => {
  return service.post('/emotion-diary', data)
}
//获取文章列表
export const getArticleList = (params) => {
  return service.get('/knowledge/article/page', { params })
}
//获取文章详情
export const getArticleDetail = (articleId) => {
  return service.get(`/knowledge/article/${articleId}`)
}