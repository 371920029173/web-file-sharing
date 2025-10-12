'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, FileItem, Announcement } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { 
  Users, 
  FileText, 
  Megaphone, 
  Shield, 
  Crown, 
  CheckCircle, 
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  HardDrive,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<User[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info',
    isActive: true
  })
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  useEffect(() => {
    if (user && (user.is_admin || user.is_moderator)) {
      fetchData()
    } else if (user && !user.is_admin && !user.is_moderator) {
      toast.error('权限不足')
      router.push('/')
    }
  }, [user, router])

  // 用户搜索过滤
  useEffect(() => {
    if (!userSearchQuery.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(u => 
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.id.includes(userSearchQuery) ||
        (u.nickname && u.nickname.toLowerCase().includes(userSearchQuery.toLowerCase()))
      )
      setFilteredUsers(filtered)
    }
  }, [users, userSearchQuery])

  // 初始化时显示所有用户
  useEffect(() => {
    if (users.length > 0 && filteredUsers.length === 0) {
      setFilteredUsers(users)
    }
  }, [users, filteredUsers.length])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (user?.is_admin) {
        // 管理员可以查看所有数据 - 使用API路由绕过RLS
        const [usersResponse, filesData, announcementsData] = await Promise.all([
          fetch(`/api/admin/users?adminId=${user.id}`),
          supabase.from('files').select('*').order('created_at', { ascending: false }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false })
        ])
        
        const usersResult = await usersResponse.json()
        const usersData = usersResult.success ? { data: usersResult.data } : { data: [] }
        
        setUsers(usersData.data || [])
        setFiles(filesData.data || [])
        setAnnouncements(announcementsData.data || [])
      } else if (user?.is_moderator) {
        // 审核员只能查看文件
        const { data: filesData } = await supabase
          .from('files')
          .select('*')
          .order('created_at', { ascending: false })
        
        setFiles(filesData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUserRoleChange = async (userId: string, field: 'is_admin' | 'is_moderator', value: boolean) => {
    if (!user?.is_admin) return
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: user.id,
          targetUserId: userId,
          field: field,
          value: value
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('用户权限更新成功')
        fetchData()
      } else {
        toast.error(result.error || '权限更新失败')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('权限更新失败')
    }
  }

  const handleFileApproval = async (fileId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ is_approved: approved })
        .eq('id', fileId)

      if (error) throw error

      toast.success(approved ? '文件审核通过' : '文件审核拒绝')
      fetchData()
    } catch (error) {
      console.error('Error updating file approval:', error)
      toast.error('操作失败')
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)

      if (error) throw error

      toast.success('公告删除成功')
      fetchData()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('公告删除失败')
    }
  }

  const handlePublishAnnouncement = async () => {
    if (!user) return
    
    console.log('发布公告 - 用户信息:', user)
    
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          type: newAnnouncement.type,
          authorId: user.id,
          authorName: user.username,
          isActive: newAnnouncement.isActive
        })
      })

      const result = await response.json()
      console.log('公告发布响应:', result)
      
      if (result.success) {
        toast.success('公告发布成功！')
        setShowAnnouncementForm(false)
        setNewAnnouncement({ title: '', content: '', type: 'info', isActive: true })
        fetchData()
      } else {
        toast.error(result.error || '发布失败')
      }
    } catch (error) {
      console.error('Error publishing announcement:', error)
      toast.error('发布失败，请重试')
    }
  }

  if (!user || (!user.is_admin && !user.is_moderator)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h1>
          <p className="text-gray-600">您没有权限访问此页面</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理后台</h1>
          <p className="text-gray-600">
            欢迎回来，{user.username} 
            {user.is_admin && <Crown className="inline w-5 h-5 ml-2 text-yellow-500" />}
            {user.is_moderator && <Shield className="inline w-5 h-5 ml-2 text-blue-500" />}
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {user.is_admin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="inline w-4 h-4 mr-2" />
                用户管理
              </button>
            )}
            <button
              onClick={() => setActiveTab('files')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'files'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline w-4 h-4 mr-2" />
              文件审核
            </button>
            {user.is_admin && (
              <button
                onClick={() => setActiveTab('announcements')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'announcements'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Megaphone className="inline w-4 h-4 mr-2" />
                公告管理
              </button>
            )}
            {user.is_admin && (
              <button
                onClick={() => router.push('/admin/storage')}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <HardDrive className="inline w-4 h4 mr-2" />
                存储管理
              </button>
            )}
          </nav>
        </div>

        {/* 用户管理 */}
        {activeTab === 'users' && user.is_admin && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">用户管理</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索用户名、ID或昵称..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  共 {filteredUsers.length} 个用户
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {userItem.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              存储: {Math.round(userItem.storage_used / 1024 / 1024)}MB / {Math.round(userItem.storage_limit / 1024 / 1024)}MB
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {userItem.is_admin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Crown className="w-3 h-3 mr-1" />
                              管理员
                            </span>
                          )}
                          {userItem.is_moderator && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3 mr-1" />
                              审核员
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userItem.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {userItem.id !== user.id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUserRoleChange(userItem.id, 'is_admin', !userItem.is_admin)}
                              className={`px-3 py-1 rounded text-xs ${
                                userItem.is_admin
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {userItem.is_admin ? '取消管理员' : '设为管理员'}
                            </button>
                            <button
                              onClick={() => handleUserRoleChange(userItem.id, 'is_moderator', !userItem.is_moderator)}
                              className={`px-3 py-1 rounded text-xs ${
                                userItem.is_moderator
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {userItem.is_moderator ? '取消审核员' : '设为审核员'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 文件审核 */}
        {activeTab === 'files' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">文件审核</h2>
            <div className="space-y-4">
              {files.filter(f => !f.is_approved).map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{file.original_name}</h3>
                      <p className="text-sm text-gray-500">
                        作者：{file.author_name} | 
                        大小：{Math.round(file.file_size / 1024)}KB | 
                        类型：{file.file_type}
                      </p>
                      {file.description && (
                        <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFileApproval(file.id, true)}
                        className="btn-primary flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        通过
                      </button>
                      <button
                        onClick={() => handleFileApproval(file.id, false)}
                        className="btn-secondary flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        拒绝
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {files.filter(f => !f.is_approved).length === 0 && (
                <p className="text-center text-gray-500 py-8">暂无待审核的文件</p>
              )}
            </div>
          </div>
        )}

        {/* 公告管理 */}
        {activeTab === 'announcements' && user.is_admin && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">公告管理</h2>
              <button 
                onClick={() => setShowAnnouncementForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                发布公告
              </button>
            </div>
            
            {/* 发布公告表单 */}
            {showAnnouncementForm && (
              <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">发布新公告</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">公告标题</label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入公告标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">公告内容</label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入公告内容"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">公告类型</label>
                      <select
                        value={newAnnouncement.type}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="info">信息</option>
                        <option value="warning">警告</option>
                        <option value="success">成功</option>
                        <option value="error">错误</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newAnnouncement.isActive}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700">立即发布</label>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePublishAnnouncement}
                      disabled={!newAnnouncement.title || !newAnnouncement.content}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      发布公告
                    </button>
                    <button
                      onClick={() => {
                        setShowAnnouncementForm(false)
                        setNewAnnouncement({ title: '', content: '', type: 'info', isActive: true })
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>发布者：{announcement.created_by}</span>
                        <span>发布时间：{new Date(announcement.created_at).toLocaleDateString('zh-CN')}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.is_active ? '已发布' : '已下线'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-secondary flex items-center">
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="btn-secondary text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center text-gray-500 py-8">暂无公告</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 