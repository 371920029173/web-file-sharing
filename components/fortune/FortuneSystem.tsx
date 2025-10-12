'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { FortuneResult } from '@/lib/supabase'
import { Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const fortuneResults = {
  '大吉': {
    description: '诸事皆宜',
    goodEvents: ['事业有成', '财运亨通', '感情美满'],
    badEvents: ['无', '无', '无'],
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  },
  '中吉': {
    description: '大部分事情顺利',
    goodEvents: ['工作顺利', '学习进步', '人际关系和谐'],
    badEvents: ['避免冲动消费', '无', '无'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  '小吉': {
    description: '小事情顺利',
    goodEvents: ['心情愉悦', '身体健康', '小有收获'],
    badEvents: ['避免争吵', '注意饮食', '无'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-300'
  },
  '中平': {
    description: '平平淡淡',
    goodEvents: ['保持现状', '稳定发展', '无大起大落'],
    badEvents: ['避免冒险', '谨慎决策', '注意细节'],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300'
  },
  '凶': {
    description: '需要谨慎',
    goodEvents: ['无', '无', '无'],
    badEvents: ['避免冲突', '注意安全', '谨慎投资'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300'
  },
  '大凶': {
    description: '诸事不宜',
    goodEvents: ['无', '无', '无'],
    badEvents: ['避免外出', '避免决策', '避免投资'],
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300'
  }
}

export default function FortuneSystem() {
  const { user } = useAuth()
  const [canFortune, setCanFortune] = useState(true)
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [nextResetTime, setNextResetTime] = useState<string>('')

  useEffect(() => {
    if (user) {
      checkFortuneStatus()
      calculateNextResetTime()
    }
  }, [user])

  const checkFortuneStatus = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('fortune_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setCanFortune(false)
        setFortuneResult(data)
      } else {
        setCanFortune(true)
      }
    } catch (error) {
      console.error('Error checking fortune status:', error)
    }
  }

  const calculateNextResetTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(4, 0, 0, 0) // 东八区凌晨4点

    if (now.getHours() >= 4) {
      tomorrow.setDate(tomorrow.getDate() + 1)
    }

    setNextResetTime(tomorrow.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }))
  }

  const performFortune = async () => {
    if (!user || !canFortune) return

    setIsLoading(true)
    
    try {
      // 随机选择占卜结果
      const results = Object.keys(fortuneResults) as Array<keyof typeof fortuneResults>
      const randomResult = results[Math.floor(Math.random() * results.length)]
      const today = new Date().toISOString().split('T')[0]

      // 保存占卜结果到数据库
      const { data, error } = await supabase
        .from('fortune_results')
        .insert({
          user_id: user.id,
          result: randomResult,
          date: today
        })
        .select()
        .single()

      if (error) throw error

      setFortuneResult(data)
      setCanFortune(false)
      toast.success('占卜完成！')
    } catch (error) {
      console.error('Error performing fortune:', error)
      toast.error('占卜失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="card text-center">
        <div className="text-gray-500 mb-4">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium">需要登录</h3>
          <p className="text-sm">请先登录账号才能使用占卜功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">今日占卜</h1>
          <p className="text-gray-600">每日限占卜一次，凌晨4点刷新</p>
        </div>

        {canFortune ? (
          <div className="mb-6">
            <button
              onClick={performFortune}
              disabled={isLoading}
              className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '占卜中...' : '开始占卜'}
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="w-5 h-5 mr-2" />
              今日已占卜
            </div>
          </div>
        )}

        {fortuneResult && (
          <div className={`border-2 rounded-xl p-6 ${fortuneResults[fortuneResult.result].borderColor} ${fortuneResults[fortuneResult.result].bgColor}`}>
            <div className={`text-4xl font-bold mb-4 ${fortuneResults[fortuneResult.result].color}`}>
              {fortuneResult.result}
            </div>
            <div className="text-lg text-gray-700 mb-6">
              {fortuneResults[fortuneResult.result].description}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  宜做之事
                </h4>
                <ul className="space-y-2">
                  {fortuneResults[fortuneResult.result].goodEvents.map((event, index) => (
                    <li key={index} className="text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  不宜之事
                </h4>
                <ul className="space-y-2">
                  {fortuneResults[fortuneResult.result].badEvents.map((event, index) => (
                    <li key={index} className="text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>下次重置时间：{nextResetTime}</p>
        </div>
      </div>
    </div>
  )
} 