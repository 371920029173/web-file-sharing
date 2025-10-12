'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Code,
  Eye,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  id: string
  filename: string
  file_type: string
  file_size: number
  file_url: string
  is_public: boolean
  is_approved: boolean
  created_at: string
  user_id: string
  username?: string
}

export default function MessageFilePreview() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [file, setFile] = useState<FileItem | null>(null)
  const [loading, setLoading] = useState(true)

  const fileId = params.id as string

  useEffect(() => {
    if (fileId && !authLoading) {
      fetchFileDetails()
    }
  }, [fileId, authLoading])

  const fetchFileDetails = async () => {
    try {
      if (authLoading) {
        console.log('等待用户信息加载...')
        return
      }

      console.log('私信文件预览查询参数:', {
        fileId,
        userId: user?.id,
        username: user?.username,
        authLoading
      })

      // 私信文件预览：允许用户查看自己发送或接收的文件
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          users!files_user_id_fkey(username)
        `)
        .eq('id', fileId)
        .or(`user_id.eq.${user?.id},is_public.eq.true`)

      if (error) {
        console.error('文件查询错误:', error)
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('文件不存在或无权访问')
      }

      const fileData = data[0]
      setFile({
        ...fileData,
        username: fileData.users?.username
      })
    } catch (error) {
      console.error('Error fetching file:', error)
      toast.error('文件不存在或无权访问')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5" />
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-5 h-5" />
    if (fileType.includes('code') || fileType.includes('text')) return <Code className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = () => {
    if (file?.file_url) {
      const link = document.createElement('a')
      link.href = file.file_url
      link.download = file.filename
      link.click()
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 ml-4">
            {authLoading ? '正在验证用户权限...' : '加载中...'}
          </p>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">文件不存在</h1>
            <p className="text-gray-600 mb-6">该文件可能已被删除或您无权访问</p>
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回上一页
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                  {getFileIcon(file.file_type)}
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{file.filename}</h1>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!file.is_approved && (
                  <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="text-yellow-200 font-medium">待审核</span>
                  </div>
                )}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载
                </button>
                <button
                  onClick={() => window.open(file.file_url, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  打开
                </button>
              </div>
            </div>
          </div>

          {/* 文件预览区域 */}
          <div className="p-6">
            {file.file_type.startsWith('image/') ? (
              <div className="text-center">
                <img
                  src={file.file_url}
                  alt={file.filename}
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
            ) : file.file_type.startsWith('video/') ? (
              <div className="text-center">
                <video
                  controls
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                  style={{ maxHeight: '70vh' }}
                >
                  <source src={file.file_url} type={file.file_type} />
                  您的浏览器不支持视频播放
                </video>
              </div>
            ) : file.file_type.startsWith('audio/') ? (
              <div className="text-center">
                <audio
                  controls
                  className="w-full max-w-md mx-auto"
                >
                  <source src={file.file_url} type={file.file_type} />
                  您的浏览器不支持音频播放
                </audio>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {getFileIcon(file.file_type)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">文件预览</h3>
                <p className="text-gray-600 mb-4">此文件类型不支持在线预览</p>
                <p className="text-sm text-gray-500">请下载文件后使用相应软件打开</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
