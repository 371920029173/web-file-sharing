'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FileItem, Comment } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  File, 
  User, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Download,
  Eye,
  Shield,
  ArrowLeft
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function FileDetailPage() {
  const params = useParams()
  const fileId = params.id as string
  const { user, loading: authLoading } = useAuth()
  
  const [file, setFile] = useState<FileItem | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fileContent, setFileContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    if (fileId && !authLoading) {
      fetchFileDetails()
      fetchComments()
    }
  }, [fileId, authLoading])

  useEffect(() => {
    if (file) {
      console.log('文件信息:', {
        name: file.original_name,
        mime_type: file.mime_type,
        file_type: file.file_type,
        isTextPlain: file.mime_type?.includes('text/plain'),
        isTxtFile: file.original_name?.toLowerCase().endsWith('.txt')
      })
      
      if (file.mime_type?.includes('text/plain') || file.original_name?.toLowerCase().endsWith('.txt')) {
        console.log('检测到TXT文件，开始获取内容...')
        fetchFileContent()
      }
    }
  }, [file])

  const fetchFileDetails = async () => {
    try {
      // 等待用户信息加载完成
      if (authLoading) {
        console.log('等待用户信息加载...')
        return
      }
      
      // 如果是管理员，可以查看未审核的文件
      const isAdmin = user?.is_admin || user?.is_moderator
      
      console.log('文件查询参数:', {
        fileId,
        isAdmin,
        userId: user?.id,
        username: user?.username,
        authLoading
      })
      
      let query = supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
      
      // 如果不是管理员，只能查看公开且已审核的文件
      if (!isAdmin) {
        query = query.eq('is_public', true).eq('is_approved', true)
        console.log('普通用户查询条件: is_public=true, is_approved=true')
      } else {
        console.log('管理员查询条件: 无限制')
      }
      
      const { data, error } = await query.single()

      if (error) {
        console.error('文件查询错误:', error)
        throw error
      }
      
      console.log('找到文件:', data)
      setFile(data)
    } catch (error) {
      console.error('Error fetching file:', error)
      toast.error('File not found or has been deleted')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchFileContent = async () => {
    if (!file?.file_url) return
    
    setLoadingContent(true)
    try {
      const response = await fetch(file.file_url)
      if (response.ok) {
        // 尝试不同的编码方式
        const arrayBuffer = await response.arrayBuffer()
        const decoder = new TextDecoder('utf-8')
        let content = decoder.decode(arrayBuffer)
        
        // 如果解码失败，尝试其他编码
        if (content.includes('�')) {
          try {
            const decoderGBK = new TextDecoder('gbk')
            content = decoderGBK.decode(arrayBuffer)
          } catch {
            // 如果还是失败，使用原始文本
            content = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer)
          }
        }
        
        setFileContent(content)
      } else {
        setFileContent('Unable to load file content')
      }
    } catch (error) {
      console.error('Error fetching file content:', error)
      setFileContent('Error loading file content')
    } finally {
      setLoadingContent(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      // 这里需要用户登录验证
      const { error } = await supabase
        .from('comments')
        .insert({
          file_id: fileId,
          user_id: 'temp-user-id', // 实际使用时从认证上下文获取
          username: '匿名用户', // 实际使用时从认证上下文获取
          content: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      await fetchComments()
      toast.success('评论发布成功')
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return <FileText className="w-8 h-8 text-blue-500" />
      case 'image':
        return <Image className="w-8 h-8 text-green-500" />
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />
      case 'audio':
        return <Music className="w-8 h-8 text-orange-500" />
      default:
        return <File className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderFileContent = () => {
    if (!file) return null

    switch (file.file_type) {
      case 'image':
        return (
          <div className="relative group">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image className="w-6 h-6 mr-2" />
                    <span className="font-medium">图片预览</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(file.file_url, '_blank')}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                      title="在新窗口打开"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      打开
                    </button>
                    <a
                      href={file.file_url}
                      download={file.original_name}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                      title="下载图片"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      下载
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="relative inline-block">
            <img 
              src={file.file_url} 
                    alt={file.original_name}
                    className="max-w-full h-auto rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => window.open(file.file_url, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                      <Eye className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {formatFileSize(file.file_size)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'video':
        return (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Video className="w-6 h-6 mr-2" />
                  <span className="font-medium">视频播放</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(file.file_url, '_blank')}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                    title="在新窗口打开"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    打开
                  </button>
                  <a
                    href={file.file_url}
                    download={file.original_name}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                    title="下载视频"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </a>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
            <video 
              controls 
                className="max-w-full h-auto rounded-xl shadow-lg"
                preload="metadata"
            >
              <source src={file.file_url} type="video/mp4" />
              您的浏览器不支持视频播放
            </video>
              <div className="mt-4 text-sm text-gray-600">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {formatFileSize(file.file_size)}
                </span>
              </div>
            </div>
          </div>
        )
      case 'audio':
        return (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Music className="w-6 h-6 mr-2" />
                  <span className="font-medium">音频播放</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(file.file_url, '_blank')}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                    title="在新窗口打开"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    打开
                  </button>
                  <a
                    href={file.file_url}
                    download={file.original_name}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                    title="下载音频"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </a>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{file.original_name}</h3>
                    <p className="text-sm text-gray-600">{formatFileSize(file.file_size)}</p>
                  </div>
                </div>
            <audio 
              controls 
                  className="w-full"
                  preload="metadata"
            >
              <source src={file.file_url} type="audio/mpeg" />
              您的浏览器不支持音频播放
            </audio>
              </div>
            </div>
          </div>
        )
      case 'document':
        // 检查是否是txt文件
        if (file.mime_type?.includes('text/plain')) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {/* 文件头部 */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 mr-3" />
                    <div>
                      <h2 className="text-xl font-bold">{file.original_name}</h2>
                      <p className="text-blue-100 text-sm">
                        {formatFileSize(file.file_size)} • 文本文件
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(file.file_url, '_blank')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                      title="在新窗口打开"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      打开
                    </button>
                    <a
                      href={file.file_url}
                      download={file.original_name}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                      title="下载文件"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      下载
                    </a>
                  </div>
                </div>
              </div>
              
              {/* 文件内容 */}
              <div className="p-6">
                {loadingContent ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">加载内容中...</span>
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">文件内容预览</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {fileContent.length} 字符
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {fileContent.split('\n').length} 行
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto bg-white/60 backdrop-blur-sm p-4 rounded border">
                          {fileContent || '文件内容为空'}
                        </pre>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => window.open(file.file_url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>在新窗口打开</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        } else {
          // 其他文档类型
          return (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 mr-2" />
                    <span className="font-medium">文档预览</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(file.file_url, '_blank')}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                      title="在新窗口打开"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      打开
                    </button>
                    <a
                      href={file.file_url}
                      download={file.original_name}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                      title="下载文档"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      下载
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{file.original_name}</h2>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {formatFileSize(file.file_size)}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        {file.file_type}
                      </span>
                    </div>
                  </div>
                  
              {file.description && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-2">文件描述</h3>
                  <p className="text-gray-700">{file.description}</p>
                </div>
              )}
                  
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">文档预览</h3>
                      <p className="text-gray-600 mb-4">此文档类型暂不支持在线预览</p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => window.open(file.file_url, '_blank')}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-4 h-4 inline mr-2" />
                          在新窗口打开
                        </button>
                        <a
                          href={file.file_url}
                          download={file.original_name}
                          className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Download className="w-4 h-4 inline mr-2" />
                          下载文件
                        </a>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )
        }
      default:
        return (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="w-6 h-6 mr-2" />
                  <span className="font-medium">文件预览</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(file.file_url, '_blank')}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                    title="在新窗口打开"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    打开
                  </button>
                  <a
                    href={file.file_url}
                    download={file.original_name}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm text-sm"
                    title="下载文件"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    下载
                  </a>
                </div>
              </div>
            </div>
            <div className="p-8 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <File className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">文件预览</h3>
                <p className="text-gray-600 mb-6">此文件类型暂不支持在线预览</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.open(file.file_url, '_blank')}
                    className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    在新窗口打开
                  </button>
                  <a
                    href={file.file_url}
                    download={file.original_name}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    下载文件
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文件不存在</h1>
          <p className="text-gray-600 mb-4">该文件可能已被删除或不存在</p>
          <p className="text-sm text-gray-500 mb-4">文件ID: {fileId}</p>
          <div className="mt-8 flex flex-col items-center space-y-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回上一页
            </button>
            {user?.is_admin && (
              <div className="p-4 bg-blue-50 rounded-lg max-w-md">
                <h3 className="font-medium text-blue-900 mb-2">管理员调试信息</h3>
                <p className="text-sm text-blue-700">
                  作为管理员，你可以查看所有文件（包括未审核的）。
                  如果这个文件ID确实存在，可能是权限或查询条件的问题。
                </p>
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  前往管理后台查看文件列表
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* 文件头部信息 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {getFileTypeIcon(file.file_type)}
              </div>
            <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{file.original_name}</h1>
                <div className="flex items-center space-x-6 text-sm text-blue-100 mb-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{file.author_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: zhCN })}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{file.likes_count} 次查看</span>
                </div>
                  {/* 审核状态提示 - 仅管理员可见 */}
                  {user?.is_admin && !file.is_approved && (
                    <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="text-yellow-200 font-medium">待审核</span>
                    </div>
                  )}
              </div>
              {file.description && (
                  <p className="text-blue-100 mb-4">{file.description}</p>
              )}
              <div className="flex items-center space-x-4">
                  <a
                    href={file.file_url}
                    download={file.original_name}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm flex items-center"
                  >
                  <Download className="w-4 h-4 mr-2" />
                  下载文件
                  </a>
                  <button className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  收藏
                </button>
              </div>
            </div>
              <div className="text-right text-sm text-blue-100">
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs opacity-80">文件大小</div>
                  <div className="font-bold text-lg">{formatFileSize(file.file_size)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 文件内容 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-500" />
              文件内容
            </h2>
          </div>
          <div className="p-6">
          {renderFileContent()}
          </div>
        </div>

        {/* 评论区 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-500" />
            评论 ({comments.length})
          </h2>
          </div>
          <div className="p-6">
          {/* 发表评论 */}
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
              rows={3}
            />
                <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {submitting ? '发布中...' : '发布评论'}
              </button>
                </div>
            </div>
          </form>

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">暂无评论，快来发表第一条评论吧！</p>
                </div>
            ) : (
              comments.map((comment) => (
                  <div key={comment.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{comment.username}</span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhCN })}
                        </span>
                      </div>
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 