'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useUi } from '@/components/providers/UiProvider'
import { 
  Home, 
  User, 
  MessageSquare, 
  Cloud, 
  Settings, 
  LogOut,
  Menu,
  X,
  Crown,
  Shield,
  Share2,
  Upload,
  Search,
  Sparkles
} from 'lucide-react'

interface Notifications {
  messages: number
  fileReview: number
  storageRequests: number
}

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { uiMode, toggleUiMode } = useUi()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notifications>({
    messages: 0,
    fileReview: 0,
    storageRequests: 0
  })

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('登出错误:', error)
    }
  }

  // 获取通知数量
  const fetchNotifications = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    }
  }

  // 定期获取通知
  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
      // 每30秒更新一次通知
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  // 通知红点组件
  const NotificationDot = ({ count, className = "" }: { count: number, className?: string }) => {
    if (count === 0) return null
    
    return (
      <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold ${className}`}>
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  return (
    <nav className="nav-minimal sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={toggleUiMode}
              className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              title={uiMode === 'desktop' ? '切换到手机版布局' : '切换到电脑版布局'}
            >
              {uiMode === 'desktop' ? '电脑版' : '手机版'}
            </button>
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="首页">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="/share" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="文件分享">
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="/files" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="云盘">
              <Cloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="/upload" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="上传">
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="/search" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="搜索">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="/fortune" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="占卜">
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            {user && (
              <>
                <Link href="/messages" className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="私信">
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <NotificationDot count={notifications.messages} />
                </Link>
                {(user.is_admin || user.is_moderator) && (
                  <Link href="/admin" className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group" title="管理后台">
                    <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <NotificationDot count={notifications.fileReview + notifications.storageRequests} />
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: user.nickname_color || '#374151' }}
                  >
                    {user.username}
                  </span>
                  {user.username === '371920029173' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                      <Crown className="w-3 h-3 mr-1" />
                      超级管理员
                    </span>
                  )}
                  {user.is_admin && user.username !== '371920029173' && (
                    <Crown className="w-4 h-4 text-yellow-500" aria-label="管理员" />
                  )}
                  {user.is_moderator && user.username !== '371920029173' && (
                    <Shield className="w-4 h-4 text-blue-500" aria-label="审核员" />
                  )}
                </div>
                <Link href="/profile" className="text-gray-700 hover:text-primary-600 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="btn-secondary">
                  登录
                </Link>
                <Link href="/register" className="btn-primary">
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link 
                href="/" 
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                首页
              </Link>
              <Link 
                href="/share" 
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Share2 className="w-5 h-5" />
                文件分享
              </Link>
              <Link 
                href="/files" 
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Cloud className="w-5 h-5" />
                云盘
              </Link>
              <Link 
                href="/upload" 
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Upload className="w-5 h-5" />
                上传
              </Link>
              <Link 
                href="/search" 
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="w-5 h-5" />
                搜索
              </Link>
              <Link 
                href="/fortune" 
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles className="w-5 h-5" />
                占卜
              </Link>
              {user && (
                <>
                  <Link 
                    href="/messages" 
                    className="relative flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="w-5 h-5" />
                    私信
                    <NotificationDot count={notifications.messages} />
                  </Link>
                  {(user.is_admin || user.is_moderator) && (
                    <Link 
                      href="/admin" 
                      className="relative flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      管理后台
                      <NotificationDot count={notifications.fileReview + notifications.storageRequests} />
                    </Link>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          {user.username}
                        </span>
                        {user.username === '371920029173' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                            <Crown className="w-3 h-3 mr-1" />
                            超级管理员
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.is_admin && user.username !== '371920029173' && (
                          <Crown className="w-4 h-4 text-yellow-500" aria-label="管理员" />
                        )}
                        {user.is_moderator && user.username !== '371920029173' && (
                          <Shield className="w-4 h-4 text-blue-500" aria-label="审核员" />
                        )}
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      个人资料
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 