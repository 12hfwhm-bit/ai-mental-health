export const baseURL = 'http://159.75.169.224:1235'

/** 获取文章封面路径（用户端 coverImage / 管理端 coverImg） */
export function getArticleCover(article) {
  if (!article) return ''
  return article.coverImage || article.coverImg || ''
}

/** 将封面转为保存用的相对路径（如 /files/...） */
export function normalizeCoverForSave(cover) {
  if (!cover) return ''
  if (/^https?:\/\//i.test(cover)) {
    const host = baseURL.replace(/\/$/, '')
    if (cover.startsWith(host)) return cover.slice(host.length)
    try {
      return new URL(cover).pathname
    } catch {
      return cover
    }
  }
  return cover.startsWith('/') ? cover : `/${cover}`
}

/** 从上传接口返回值中提取文件路径 */
export function extractFilePath(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  return data.url || data.fileUrl || data.path || data.filePath || ''
}

/**
 * 将后端返回的文件路径转为浏览器可访问的 URL
 * - 静态资源 /files/ 直接访问，不加 /api 前缀
 * - 开发环境走 Vite 代理（/files、/api），避免跨域
 */
export function getFileUrl(url, defaultUrl = '') {
  const path = extractFilePath(url)
  if (!path) return defaultUrl
  if (/^https?:\/\//i.test(path)) return path

  const normalized = path.startsWith('/') ? path : `/${path}`

  // 上传接口返回的静态文件路径，如 /files/bussiness/article/xxx.jpg
  if (normalized.startsWith('/files/')) {
    return import.meta.env.DEV ? normalized : baseURL.replace(/\/$/, '') + normalized
  }

  if (import.meta.env.DEV) {
    return normalized.startsWith('/api') ? normalized : `/api${normalized}`
  }
  return baseURL.replace(/\/$/, '') + normalized
}
