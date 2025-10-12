import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并CSS类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 相对时间
export function timeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`
  
  return formatDate(date)
}

// 生成随机ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('密码长度至少8位')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('包含小写字母')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('包含大写字母')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('包含数字')

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push('包含特殊字符')

  return { score, feedback }
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 生成占卜结果
export function generateFortuneResult(): '大吉' | '中吉' | '小吉' | '中平' | '凶' | '大凶' {
  const results = ['大吉', '中吉', '小吉', '中平', '凶', '大凶']
  const weights = [0.1, 0.2, 0.25, 0.25, 0.15, 0.05] // 概率权重
  
  const random = Math.random()
  let cumulativeWeight = 0
  
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i]
    if (random <= cumulativeWeight) {
      return results[i] as any
    }
  }
  
  return '中平'
}

// 检查是否为移动设备
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

// 下载文件
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 获取文件类型图标
export function getFileTypeIcon(fileType: string): string {
  const iconMap: Record<string, string> = {
    'image': '🖼️',
    'video': '🎥',
    'audio': '🎵',
    'document': '📄',
    'pdf': '📕',
    'archive': '📦',
    'code': '💻',
    'other': '📎'
  }
  
  return iconMap[fileType] || iconMap.other
}

// 验证文件类型
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// 生成文件预览URL
export function createFilePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// 清理文件预览URL
export function revokeFilePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
} 