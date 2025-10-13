'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedUser, setEditedUser] = useState<any>(null)

  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [submittingAvatar, setSubmittingAvatar] = useState(false)

  useEffect(() => {
    if (user) {
      setEditedUser({ username: user.username, nickname_color: user.nickname_color || '#3B82F6' })
    }
  }, [user])

  const handleSave = async () => {
    if (!user || !editedUser) return
    try {
      setSaving(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }
      const res = await fetch('/api/profile/update', {
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
      const json = await res.json()
      if (json.success) {
        toast.success('个人资料已更新')
        setIsEditing(false)
        refreshUser && refreshUser()
      } else {
        toast.error(json.error || '更新失败')
      }
    } catch (e) {
      console.error(e)
      toast.error('更新失败')
    } finally {
      setSaving(false)
    }
  }

  const submitAvatarRequest = async () => {
    if (!user) return
    try {
      setSubmittingAvatar(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      let finalUrl = avatarUrl
      if (avatarFile) {
        const bucket = 'avatars'
        const ext = avatarFile.name.split('.').pop() || 'png'
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadRes, error: uploadErr } = await supabase.storage.from(bucket).upload(path, avatarFile, { upsert: false, cacheControl: '3600' })
        if (uploadErr) {
          toast.error('上传失败：' + uploadErr.message)
          return
        }
        const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(uploadRes.path)
        finalUrl = publicUrl.publicUrl
      }

      if (!finalUrl) {
        toast.error('请先选择图片或填写图片URL')
        return
      }

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ new_avatar_url: finalUrl })
      })
      const json = await res.json()
      if (json.success) {
        toast.success('已提交头像审核')
        setAvatarUrl('')
        setAvatarFile(null)
      } else {
        toast.error(json.error || '提交失败')
      }
    } catch (e) {
      console.error(e)
      toast.error('提交失败')
    } finally {
      setSubmittingAvatar(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 text-center border border-white/30">
            <h1 className="text-2xl font-bold text-gray-900">请先登录</h1>
            <p className="text-gray-600 mt-2">登录后可编辑个人资料并提交头像审核</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-white/30 shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">基本信息</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">编辑</button>
                ) : (
                  <div className="space-x-2">
                    <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? '保存中…' : '保存'}</button>
                    <button disabled={saving} onClick={() => { setIsEditing(false); setEditedUser({ username: user.username, nickname_color: user.nickname_color || '#3B82F6' }) }} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">取消</button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">用户名</label>
                  {isEditing ? (
                    <input value={editedUser?.username || ''} onChange={e => setEditedUser((p:any)=>({ ...p, username: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <p className="text-gray-900">{user.username}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">邮箱</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">昵称颜色</label>
                  {isEditing ? (
                    <input type="color" value={editedUser?.nickname_color || '#3B82F6'} onChange={e => setEditedUser((p:any)=>({ ...p, nickname_color: e.target.value }))} className="w-16 h-10 border rounded" />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full border" style={{ backgroundColor: user.nickname_color }} />
                      <span className="text-gray-900">{user.nickname_color}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-white/30 shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">更换头像（提交审核）</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input id="avatarFile" type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} className="hidden" />
                  <label htmlFor="avatarFile" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                    选择文件
                  </label>
                  <span className="text-sm text-gray-500 truncate max-w-[50%]">
                    {avatarFile ? avatarFile.name : '未选择任何文件'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="或粘贴图片URL，例如 https://.../avatar.png" className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button disabled={submittingAvatar} onClick={submitAvatarRequest} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{submittingAvatar ? '提交中…' : '提交审核'}</button>
                </div>
                <p className="text-xs text-gray-500">支持直接上传或填写图片 URL。提交后由审核员审批。</p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-white/30 shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">账户概览</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between"><span>管理员</span><span>{user.is_admin ? '是' : '否'}</span></div>
                <div className="flex justify-between"><span>审核员</span><span>{user.is_moderator ? '是' : '否'}</span></div>
                <div className="flex justify-between"><span>注册时间</span><span>{new Date(user.created_at).toLocaleDateString('zh-CN')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 