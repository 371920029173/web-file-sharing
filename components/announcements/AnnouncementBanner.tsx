'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Announcement } from '@/lib/supabase'
import { Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [announcements.length])

  const fetchAnnouncements = async () => {
    try {
      // 检查Supabase连接
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log('Supabase not configured, skipping announcements fetch')
        return
      }

      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching announcements:', error)
        return
      }
      
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const closeBanner = () => {
    setIsVisible(false)
  }

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  if (!isVisible || announcements.length === 0) {
    return null
  }

  const currentAnnouncement = announcements[currentIndex]

  // 根据公告类型获取样式
  const getAnnouncementStyles = (type: string) => {
    switch (type) {
      case 'info':
        return {
          container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-900',
          content: 'text-blue-700',
          author: 'text-blue-500',
          button: 'text-blue-400 hover:text-blue-600'
        }
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-900',
          content: 'text-yellow-700',
          author: 'text-yellow-500',
          button: 'text-yellow-400 hover:text-yellow-600'
        }
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-900',
          content: 'text-red-700',
          author: 'text-red-500',
          button: 'text-red-400 hover:text-red-600'
        }
      case 'success':
        return {
          container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
          icon: 'text-green-500',
          title: 'text-green-900',
          content: 'text-green-700',
          author: 'text-green-500',
          button: 'text-green-400 hover:text-green-600'
        }
      default:
        return {
          container: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
          icon: 'text-gray-500',
          title: 'text-gray-900',
          content: 'text-gray-700',
          author: 'text-gray-500',
          button: 'text-gray-400 hover:text-gray-600'
        }
    }
  }

  const styles = getAnnouncementStyles(currentAnnouncement.type)

  return (
    <div className={`${styles.container} border rounded-lg p-4 mb-8 relative`}>
      {/* 关闭按钮 */}
      <button
        onClick={closeBanner}
        className={`absolute top-2 right-2 ${styles.button} transition-colors`}
      >
        <X className="w-5 h-5" />
      </button>

      {/* 公告内容 */}
      <div className="flex items-center space-x-3">
        <Megaphone className={`w-6 h-6 ${styles.icon} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`font-semibold ${styles.title} line-clamp-1`}>
              {currentAnnouncement.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${styles.container.replace('bg-gradient-to-r', 'bg-opacity-80')} ${styles.title.replace('text-', 'text-').replace('-900', '-600')}`}>
              {currentAnnouncement.type === 'info' ? '信息' : 
               currentAnnouncement.type === 'warning' ? '警告' :
               currentAnnouncement.type === 'error' ? '错误' :
               currentAnnouncement.type === 'success' ? '成功' : '公告'}
            </span>
          </div>
          <p className={`text-sm ${styles.content} line-clamp-2`}>
            {currentAnnouncement.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${styles.author}`}>
              发布者：{currentAnnouncement.author_name}
            </span>
            {announcements.length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevAnnouncement}
                  className={`p-1 ${styles.button} transition-colors`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className={`text-xs ${styles.author}`}>
                  {currentIndex + 1} / {announcements.length}
                </span>
                <button
                  onClick={nextAnnouncement}
                  className={`p-1 ${styles.button} transition-colors`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 