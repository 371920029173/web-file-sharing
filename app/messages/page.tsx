'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import { TopAdBanner, BottomAdBanner } from '@/components/ads/AdBanner'
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  User, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Code,
  Download,
  ExternalLink,
  X,
  Eye,
  Paperclip,
  File
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  username: string
  nickname?: string
  nickname_color?: string
}

interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  last_message_at: string
  other_user?: User
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  file_name?: string
  file_type?: string
  file_url?: string
  file_size?: number
  created_at: string
  sender?: User
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // 获取会话列表
  const fetchConversations = async () => {
    if (!user?.id) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('会话列表API响应:', data)
        if (data.success) {
          console.log('设置会话列表:', data.conversations)
          setConversations(data.conversations || [])
        }
      } else {
        toast.error('获取会话列表失败')
      }
    } catch (error) {
      console.error('获取会话列表失败:', error)
      toast.error('获取会话列表失败')
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedFile) || !selectedConversation || !user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('会话已过期，请重新登录')
        return
      }

      let messageData: any = {
        conversationId: selectedConversation.id,
        content: inputMessage.trim() || '',
        messageType: selectedFile ? 'file' : 'text',
        senderId: user.id
      }

      // 如果有文件，先上传文件
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('userId', user.id)
        formData.append('isPublic', 'false')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          console.error('文件上传失败:', uploadError)
          toast.error(uploadError.error || '文件上传失败')
          return
        }
        
        const uploadData = await uploadResponse.json()
        console.log('文件上传成功:', uploadData)
        
        if (uploadData.success && uploadData.data && uploadData.data.file) {
          messageData.fileName = uploadData.data.file.original_name
          messageData.fileType = uploadData.data.file.file_type
          messageData.fileUrl = uploadData.data.file.url
          messageData.fileSize = uploadData.data.file.size
        }
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(messageData)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('消息发送API响应:', data)
        
        if (data.success && data.data && data.data.message) {
          // 更新消息列表
          setMessages(prev => [...prev, data.data.message])
          
          // 更新会话列表中的最后消息时间
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, last_message_at: new Date().toISOString() }
              : conv
          ))
          
          toast.success('消息发送成功')
        } else {
          toast.error(data.message || '消息发送失败')
        }
      } else {
        const error = await response.json()
        toast.error(error.message || '消息发送失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error('发送消息失败')
    } finally {
      setInputMessage('')
      setSelectedFile(null)
    }
  }

  // 获取消息列表
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/messages/history?conversationId=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.data || [])
          console.log('获取到的消息:', data.data)
        }
      }
    } catch (error) {
      console.error('获取消息失败:', error)
    }
  }

  // 搜索用户
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/messages/search-users?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSearchResults(data.users || [])
        }
      }
    } catch (error) {
      console.error('搜索用户失败:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // 创建新会话
  const createConversation = async (otherUserId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ otherUserId })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchConversations()
          setShowNewChat(false)
          setSearchQuery('')
          setSearchResults([])
        }
      }
    } catch (error) {
      console.error('创建会话失败:', error)
    }
  }

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-4 h-4" />
    if (fileType.includes('code') || fileType.includes('text')) return <Code className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    
    return date.toLocaleDateString()
  }

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h1>
            <p className="text-gray-600">您需要登录才能使用私信功能</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <TopAdBanner />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="flex h-[calc(100vh-200px)]">
            {/* 左侧会话列表 */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50/50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">私信</h2>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    新对话
                  </button>
                </div>
                
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索已有联系人..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无会话</h3>
                    <p className="text-gray-600 mb-4">开始您的第一次对话吧</p>
                    <button
                      onClick={() => setShowNewChat(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      创建新对话
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-blue-100 border border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {conversation.other_user?.nickname?.[0] || conversation.other_user?.username?.[0] || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 truncate">
                              {conversation.other_user?.nickname || conversation.other_user?.username || '未知用户'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatTime(conversation.last_message_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧消息区域 */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* 消息头部 */}
                  <div className="p-4 border-b border-gray-200 bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedConversation.other_user?.nickname?.[0] || selectedConversation.other_user?.username?.[0] || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {selectedConversation.other_user?.nickname || selectedConversation.other_user?.username || '未知用户'}
                        </h3>
                        <p className="text-sm text-gray-500">在线</p>
                      </div>
                    </div>
                  </div>

                  {/* 消息列表 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>暂无消息</p>
                        <p className="text-sm">开始你们的对话吧</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.sender_id === user.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {message.message_type === 'file' && message.file_name ? (
                              <div className="space-y-2">
                                {/* 图片直接显示 */}
                                {message.file_type?.startsWith('image/') ? (
                                  <div className="space-y-2">
                                    <img
                                      src={message.file_url}
                                      alt={message.file_name}
                                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(message.file_url, '_blank')}
                                    />
                                    <div className="flex items-center gap-2 text-sm opacity-75">
                                      {getFileIcon(message.file_type || '')}
                                      <span>{message.file_name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => window.open(`/message-file/${message.id}`, '_blank')}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                                      >
                                        <Eye className="w-3 h-3" />
                                        浏览
                                      </button>
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = message.file_url || ''
                                          link.download = message.file_name || ''
                                          link.click()
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                                      >
                                        <Download className="w-3 h-3" />
                                        下载
                                      </button>
                                    </div>
                                  </div>
                                ) : message.file_type?.startsWith('video/') ? (
                                  /* 视频直接显示 */
                                  <div className="space-y-2">
                                    <video
                                      controls
                                      className="max-w-full h-auto rounded-lg"
                                      preload="metadata"
                                    >
                                      <source src={message.file_url} type={message.file_type} />
                                      您的浏览器不支持视频播放
                                    </video>
                                    <div className="flex items-center gap-2 text-sm opacity-75">
                                      {getFileIcon(message.file_type || '')}
                                      <span>{message.file_name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => window.open(`/message-file/${message.id}`, '_blank')}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                                      >
                                        <Eye className="w-3 h-3" />
                                        浏览
                                      </button>
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = message.file_url || ''
                                          link.download = message.file_name || ''
                                          link.click()
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                                      >
                                        <Download className="w-3 h-3" />
                                        下载
                                      </button>
                                    </div>
                                  </div>
                                ) : message.file_type?.startsWith('audio/') ? (
                                  /* 音频直接显示 */
                                  <div className="space-y-2">
                                    <audio
                                      controls
                                      className="w-full"
                                      preload="metadata"
                                    >
                                      <source src={message.file_url} type={message.file_type} />
                                      您的浏览器不支持音频播放
                                    </audio>
                                    <div className="flex items-center gap-2 text-sm opacity-75">
                                      {getFileIcon(message.file_type || '')}
                                      <span>{message.file_name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => window.open(`/message-file/${message.id}`, '_blank')}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                                      >
                                        <Eye className="w-3 h-3" />
                                        浏览
                                      </button>
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = message.file_url || ''
                                          link.download = message.file_name || ''
                                          link.click()
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                                      >
                                        <Download className="w-3 h-3" />
                                        下载
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* 其他文件类型保持原样 */
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      {getFileIcon(message.file_type || '')}
                                      <span className="font-medium">{message.file_name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => window.open(`/message-file/${message.id}`, '_blank')}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                                      >
                                        <Eye className="w-3 h-3" />
                                        浏览
                                      </button>
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a')
                                          link.href = message.file_url || ''
                                          link.download = message.file_name || ''
                                          link.click()
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                                      >
                                        <Download className="w-3 h-3" />
                                        下载
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>{message.content}</div>
                            )}
                            <div className="text-xs opacity-75 mt-1">
                              {formatTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 消息输入框 */}
                  <div className="p-4 border-t border-gray-200 bg-white/50">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="file-input"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-input"
                        className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <Plus className="w-5 h-5 text-gray-600" />
                      </label>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="输入消息..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() && !selectedFile}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{selectedFile.name}</span>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                      <MessageSquare className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">请选择一个对话</h3>
                    <p className="text-gray-600">从左侧选择一个会话开始聊天</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 新对话模态框 */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新对话</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜索用户
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入用户名或昵称..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {isSearching && (
                <div className="text-center text-gray-500 py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2">搜索中...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      onClick={() => createConversation(searchUser.id)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {searchUser.nickname?.[0] || searchUser.username[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {searchUser.nickname || searchUser.username}
                        </h4>
                        <p className="text-sm text-gray-500">@{searchUser.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>未找到用户</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomAdBanner />
    </div>
  )
}
