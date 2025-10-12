'use client'

import { FileItem } from '@/lib/supabase'
import { FileText, Image, Video, Music, File, Eye, Heart, MessageCircle, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface FileCardProps {
  file: FileItem
}

export default function FileCard({ file }: FileCardProps) {
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return <FileText className="w-6 h-6 text-blue-500" />
      case 'image':
        return <Image className="w-6 h-6 text-green-500" />
      case 'video':
        return <Video className="w-6 h-6 text-purple-500" />
      case 'audio':
        return <Music className="w-6 h-6 text-orange-500" />
      default:
        return <File className="w-6 h-6 text-gray-500" />
    }
  }

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return '文档'
      case 'image':
        return '图片'
      case 'video':
        return '视频'
      case 'audio':
        return '音频'
      default:
        return '文件'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 group">
      {/* 文件类型图标 */}
      <div className="flex items-center justify-between mb-4">
        {getFileTypeIcon(file.file_type)}
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {getFileTypeLabel(file.file_type)}
        </span>
      </div>

      {/* 文件信息 */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {file.original_name}
        </h3>
        {file.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {file.description}
          </p>
        )}
      </div>

      {/* 文件元数据 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <User className="w-4 h-4 mr-2" />
          <span className="truncate">{file.author_name}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: zhCN })}</span>
        </div>
        <div className="text-sm text-gray-500">
          大小：{formatFileSize(file.file_size)}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>{file.likes_count}</span>
          </div>
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            <span>{file.favorites_count}</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            <span>{file.comments_count}</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-2">
        <Link
          href={`/file/${file.id}`}
          className="flex-1 btn-primary text-center py-2"
        >
          打开
        </Link>
        <button className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 