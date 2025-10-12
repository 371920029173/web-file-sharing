'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { SidebarAd } from '@/components/ads/AdBanner'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Edit3, 
  Save, 
  X,
  Crown,
  Shield,
  Calendar,
  Mail,
  HardDrive,
  Palette
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    limit: 0
  })

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user })
      setStorageInfo({
        used: user.storage_used || 0,
        limit: user.storage_limit || 107374182400
      })
    }
  }, [user])

  // 获取实时存储信息
  const fetchStorageInfo = async () => {
    if (!user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/files/user-files', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const totalSize = data.files?.reduce((sum: number, file: any) => sum + (file.file_size || 0), 0) || 0
        
        setStorageInfo({
          used: totalSize,
          limit: user.storage_limit || 107374182400
        })
      }
    } catch (error) {
      console.error('获取存储信息失败:', error)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    try {
      setSaving(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          username: editedUser.username,
          nickname_color: editedUser.nickname_color
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('个人资料更新成功！')
        setIsEditing(false)
        // 刷新用户信息
        if (refreshUser) {
          refreshUser()
        }
        // 更新本地状态
        setEditedUser(result.data)
      } else {
        toast.error(result.error || '更新失败，请重试')
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedUser({ ...user })
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedUser((prev: any) => ({ ...prev, [field]: value }))
  }

  // 页面加载时获取存储信息
  useEffect(() => {
    if (user) {
      fetchStorageInfo()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">请先登录</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-3">
            {/* 页面标题 */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
                    <p className="text-gray-600">管理您的账户信息和设置</p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>编辑资料</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{saving ? '保存中...' : '保存'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>取消</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 用户信息卡片 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    基本信息
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser?.username || ''}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user.username}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {user.email}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">昵称颜色</label>
                      {isEditing ? (
                        <input
                          type="color"
                          value={editedUser?.nickname_color || '#3B82F6'}
                          onChange={(e) => handleInputChange('nickname_color', e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: user.nickname_color }}
                          ></div>
                          <span className="text-gray-900">{user.nickname_color}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 账户状态 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    账户状态
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">用户角色</label>
                      <div className="flex items-center space-x-2">
                        {user.is_admin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            管理员
                          </span>
                        )}
                        {user.is_moderator && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Shield className="w-3 h-3 mr-1" />
                            审核员
                          </span>
                        )}
                        {!user.is_admin && !user.is_moderator && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            普通用户
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">注册时间</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">存储使用</label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">已使用</span>
                          <span className="text-gray-900">
                            {(storageInfo.used / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min((storageInfo.used / storageInfo.limit) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">总容量</span>
                          <span className="text-gray-900">
                            {(storageInfo.limit / 1024 / 1024 / 1024).toFixed(2)} GB
                          </span>
                        </div>
                        <button
                          onClick={fetchStorageInfo}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          刷新存储信息
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 账户安全 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">账户安全</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">修改密码</h4>
                    <p className="text-sm text-gray-600">定期更新密码以确保账户安全</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    修改密码
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">两步验证</h4>
                    <p className="text-sm text-gray-600">启用两步验证以增强账户安全性</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    启用
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <SidebarAd />
          </div>
        </div>
      </main>
    </div>
  )
} 