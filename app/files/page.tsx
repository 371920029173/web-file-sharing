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
        toast.error('Session expired, please login again')
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
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Session expired, please login again')
        return
      }

      const response = await fetch(`/api/drive/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        toast.success('File deleted successfully')
        setFiles(files.filter(f => f.id !== fileId))
        setSelectedFiles(selectedFiles.filter(id => id !== fileId))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      toast.error('Failed to delete file')
    }
  }

  // Batch delete files
  const deleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) return
    if (!confirm(`Are you sure you want to delete the selected ${selectedFiles.length} files?`)) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Session expired, please login again')
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
      toast.error('File name cannot be empty')
      return
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Session expired, please login again')
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
        toast.success('Rename successful')
        setFiles(files.map(f => 
          f.id === fileId ? { ...f, original_name: editName.trim() } : f
        ))
        setEditingFile(null)
        setEditName('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Rename failed')
      }
    } catch (error) {
      console.error('Rename error:', error)
      toast.error('Rename failed')
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login First</h1>
            <p className="text-gray-600">Login required to access cloud drive</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="flex-1">
            {/* Page title and action bar */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Cloud Drive</h1>
                  <p className="text-gray-600 mt-1">Manage your personal files</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Available space: <span className="font-medium text-blue-600">
                      {((storageInfo.limit - storageInfo.used) / 1024 / 1024 / 1024).toFixed(2)} GB
                    </span>
                    <span className="ml-2 text-gray-400">
                      (Used {(storageInfo.used / 1024 / 1024 / 1024).toFixed(2)} GB)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.location.href = '/upload'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload to Cloud Drive
                  </button>
                </div>
              </div>

              {/* Search and view toggle */}
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-white rounded-lg shadow-sm">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">加载中...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-8 text-center">
                  <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文件</h3>
                  {!searchQuery && (
                    <>
                      <p className="text-gray-600 mb-4">开始上传您的第一个文件</p>
                      <button
                        onClick={() => window.location.href = '/upload'}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        上传文件
                      </button>
                    </>
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
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
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
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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