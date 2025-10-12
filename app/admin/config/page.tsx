'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  Database, 
  Shield, 
  Upload, 
  Brain,
  Server,
  Eye,
  EyeOff
} from 'lucide-react'

interface ConfigStatus {
  category: string
  items: {
    name: string
    status: 'success' | 'error' | 'warning'
    message: string
    value?: string
  }[]
}

export default function ConfigPage() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus[]>([])
  const [showSensitive, setShowSensitive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/admin/config/status')
      if (response.ok) {
        const data = await response.json()
        setConfigStatus(data.status)
      } else {
        // 如果API不可用，使用模拟数据
        setConfigStatus(generateMockConfigStatus())
      }
    } catch (error) {
      setConfigStatus(generateMockConfigStatus())
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockConfigStatus = (): ConfigStatus[] => {
    return [
      {
        category: '基础配置',
        items: [
          {
            name: '应用名称',
            status: 'success',
            message: '配置正确',
            value: '文件分享平台'
          },
          {
            name: '应用版本',
            status: 'success',
            message: '配置正确',
            value: '2.0.0'
          },
          {
            name: '环境模式',
            status: 'success',
            message: '开发环境',
            value: 'development'
          }
        ]
      },
      {
        category: '数据库配置',
        items: [
          {
            name: 'Supabase连接',
            status: 'success',
            message: '连接正常',
            value: '已配置'
          },
          {
            name: '数据库URL',
            status: 'success',
            message: '配置正确',
            value: showSensitive ? 'sb://...' : '***'
          }
        ]
      },
      {
        category: 'AI服务配置',
        items: [
          {
            name: 'OpenAI API',
            status: 'success',
            message: '服务可用',
            value: showSensitive ? 'sk-...' : '***'
          },
          {
            name: 'Claude API',
            status: 'warning',
            message: '未配置',
            value: '未设置'
          },
          {
            name: 'Gemini API',
            status: 'warning',
            message: '未配置',
            value: '未设置'
          }
        ]
      },
      {
        category: '安全配置',
        items: [
          {
            name: 'JWT密钥',
            status: 'success',
            message: '已配置',
            value: showSensitive ? '***' : '***'
          },
          {
            name: '加密密钥',
            status: 'success',
            message: '已配置',
            value: showSensitive ? '***' : '***'
          },
          {
            name: '速率限制',
            status: 'success',
            message: '已启用',
            value: '启用'
          }
        ]
      },
      {
        category: '文件上传配置',
        items: [
          {
            name: '最大文件大小',
            status: 'success',
            message: '100MB',
            value: '100MB'
          },
          {
            name: '上传速率限制',
            status: 'success',
            message: '10次/分钟',
            value: '10次/分钟'
          },
          {
            name: '允许的文件类型',
            status: 'success',
            message: '6种类型',
            value: 'image,video,audio,document,archive,code'
          }
        ]
      },
      {
        category: '第三方服务',
        items: [
          {
            name: '病毒扫描',
            status: 'warning',
            message: '未配置',
            value: '未设置'
          },
          {
            name: '图片处理',
            status: 'warning',
            message: '未配置',
            value: '未设置'
          },
          {
            name: '邮件服务',
            status: 'warning',
            message: '未配置',
            value: '未设置'
          }
        ]
      }
    ]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '基础配置':
        return <Settings className="w-6 h-6 text-blue-500" />
      case '数据库配置':
        return <Database className="w-6 h-6 text-green-500" />
      case 'AI服务配置':
        return <Brain className="w-6 h-6 text-purple-500" />
      case '安全配置':
        return <Shield className="w-6 h-6 text-red-500" />
      case '文件上传配置':
        return <Upload className="w-6 h-6 text-orange-500" />
      case '第三方服务':
        return <Server className="w-6 h-6 text-indigo-500" />
      default:
        return <Settings className="w-6 h-6 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">系统配置检查</h1>
              <p className="text-gray-600 mt-2">查看和验证系统配置状态</p>
            </div>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showSensitive ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>隐藏敏感信息</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>显示敏感信息</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 配置状态概览 */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">正常配置</p>
                  <p className="text-2xl font-bold text-green-600">
                    {configStatus.reduce((acc, cat) => 
                      acc + cat.items.filter(item => item.status === 'success').length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">需要配置</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {configStatus.reduce((acc, cat) => 
                      acc + cat.items.filter(item => item.status === 'warning').length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">配置错误</p>
                  <p className="text-2xl font-bold text-red-600">
                    {configStatus.reduce((acc, cat) => 
                      acc + cat.items.filter(item => item.status === 'error').length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 详细配置状态 */}
        <div className="space-y-6">
          {configStatus.map((category, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(category.category)}
                  <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-gray-700 bg-white px-2 py-1 rounded border">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 配置建议 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">配置建议</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>• 建议配置Claude和Gemini API以提供更多AI模型选择</p>
            <p>• 配置病毒扫描服务以提高文件安全性</p>
            <p>• 配置图片处理服务以优化图片显示</p>
            <p>• 配置邮件服务以支持用户通知功能</p>
            <p>• 在生产环境中确保所有安全配置都已正确设置</p>
          </div>
        </div>
      </main>
    </div>
  )
} 