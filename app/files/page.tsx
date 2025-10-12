'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { SidebarAd } from '@/components/ads/AdBanner'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { 
  Folder, File, Trash2, Download, Share2, Edit3, 
  MoreVertical, Upload, Search, Grid, List, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  id: string
  filename: string
  original_name: string
  file_size: number
  mime_type: string
  created_at: string
  is_public: boolean
}

export default function FilesPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    limit: 0
  })

  // Get user files (cloud drive: drive_files)
  const fetchFiles = async () => {
    if (!user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      const response = await fetch('/api/drive/user-files', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const fileList = data.files || []
        setFiles(fileList)
        
        // Calculate actual storage usage
        const totalSize = fileList.reduce((sum: number, file: any) => sum + (file.file_size || 0), 0)
        setStorageInfo({
          used: totalSize,
          limit: user.storage_limit || 107374182400
        })
      } else {
        console.error('Failed to get files')
        toast.error('Failed to get files')
      }
    } catch (error) {
      console.error('Failed to get files:', error)
      toast.error('Failed to get files')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete file (cloud drive)
  const deleteFile = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？此操作无法撤销。')) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      const response = await fetch(`/api/drive/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        toast.success('文件删除成功')
        setFiles(files.filter(f => f.id !== fileId))
        setSelectedFiles(selectedFiles.filter(id => id !== fileId))
      } else {
        const error = await response.json()
        toast.error(error.error || '删除失败')
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      toast.error('删除失败')
    }
  }

  // Preview file
  const previewFile = async (file: FileItem) => {
    try {
      // 直接使用文件ID打开预览页面
      window.open(`/file/${file.id}`, '_blank')
    } catch (error) {
      console.error('Error previewing file:', error)
      toast.error('预览失败，请重试')
    }
  }

  // Batch delete files
  const deleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) return
    if (!confirm(`确定要删除选中的 ${selectedFiles.length} 个文件吗？`)) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      const response = await fetch('/api/drive/batch-delete', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ fileIds: selectedFiles })
      })
      
      if (response.ok) {
        toast.success('Batch delete successful')
        setFiles(files.filter(f => !selectedFiles.includes(f.id)))
        setSelectedFiles([])
      } else {
        const error = await response.json()
        toast.error(error.error || 'Batch delete failed')
      }
    } catch (error) {
      console.error('Batch delete error:', error)
      toast.error('Batch delete failed')
    }
  }

  // Rename file
  const startEdit = (file: FileItem) => {
    setEditingFile(file.id)
    setEditName(file.original_name)
  }

  const saveEdit = async (fileId: string) => {
    if (!editName.trim()) {
      toast.error('文件名不能为空')
      return
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      const response = await fetch(`/api/drive/${fileId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ original_name: editName.trim() })
      })
      
      if (response.ok) {
        toast.success('重命名成功')
        setFiles(files.map(f => 
          f.id === fileId ? { ...f, original_name: editName.trim() } : f
        ))
        setEditingFile(null)
        setEditName('')
      } else {
        const error = await response.json()
        toast.error(error.error || '重命名失败')
      }
    } catch (error) {
      console.error('Rename error:', error)
      toast.error('重命名失败')
    }
  }

  const cancelEdit = () => {
    setEditingFile(null)
    setEditName('')
  }

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map(f => f.id))
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.startsWith('text/')) return '📄'
    if (mimeType.includes('pdf')) return '📕'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📗'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📙'
    return '📁'
  }

  // Filter files
  const filteredFiles = files.filter(file =>
    file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
            <p className="text-gray-600">需要登录才能访问云盘</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="flex-1">
            {/* Page title and action bar */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">我的云盘</h1>
                  <p className="text-gray-600 mt-1">管理您的个人文件</p>
                  <div className="mt-2 text-sm text-gray-500">
                    可用空间: <span className="font-medium text-blue-600">
                      {((storageInfo.limit - storageInfo.used) / 1024 / 1024 / 1024).toFixed(2)} GB
                    </span>
                    <span className="ml-2 text-gray-400">
                      (已使用 {(storageInfo.used / 1024 / 1024 / 1024).toFixed(2)} GB)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.location.href = '/upload'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    上传到云盘
                  </button>
                </div>
              </div>

              {/* Search and view toggle */}
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索文件..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Batch operation bar */}
            {selectedFiles.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">
                    已选择 {selectedFiles.length} 个文件
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={deleteSelectedFiles}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除选中
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 文件列表 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">加载中...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Folder className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">暂无文件</h3>
                  {!searchQuery ? (
                    <>
                      <p className="text-gray-600 mb-6">开始上传您的第一个文件</p>
                      <button
                        onClick={() => window.location.href = '/upload'}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        上传文件
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-600">没有找到匹配的文件</p>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  {/* 表头 */}
                  <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === files.length && files.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-500">全选</span>
                  </div>

                  {/* 文件列表 */}
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                          
                          <div className="flex-1 min-w-0">
                            {editingFile === file.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveEdit(file.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-gray-900 truncate">
                                  {file.original_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => previewFile(file)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="预览"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEdit(file)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="重命名"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const { data: { session } } = await supabase.auth.getSession()
                                if (!session) { toast.error('会话已过期，请重新登录'); return }
                                const res = await fetch(`/api/drive/${file.id}`, { headers: { 'Authorization': `Bearer ${session.access_token}` } })
                                const data = await res.json()
                                if (data.success && data.url) {
                                  window.open(data.url, '_blank')
                                } else {
                                  toast.error(data.error || '获取下载链接失败')
                                }
                              } catch (e) { toast.error('下载失败') }
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="下载"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏广告 */}
          <div className="w-80">
            <SidebarAd />
          </div>
        </div>
      </div>
    </div>
  )
} 