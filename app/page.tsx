import { TopAdBanner } from '@/components/ads/AdBanner'
import { BottomAdBanner } from '@/components/ads/AdBanner'
import Navbar from '@/components/layout/Navbar'
import FileGrid from '@/components/files/FileGrid'
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner'
import { 
  Upload, 
  Search, 
  Users, 
  FileText, 
  Star, 
  TrendingUp, 
  Zap,
  Shield,
  Globe,
  Heart,
  Download,
  Eye,
  FolderOpen,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  // 实时功能入口
  const quickActions = [
    {
      title: '云盘管理',
      description: '管理您的文件和文件夹',
      icon: FolderOpen,
      href: '/files',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '上传文件',
      description: '分享您的文件资源',
      icon: Upload,
      href: '/upload',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '搜索文件',
      description: '快速找到需要的内容',
      icon: Search,
      href: '/search',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  const features = [
    {
      title: '云盘管理',
      description: '智能云盘管理，为您提供高效的文件存储和组织服务',
      icon: FolderOpen,
      color: 'from-purple-500 to-pink-500',
      href: '/files'
    },
    {
      title: '私信系统',
      description: '与朋友和同事进行私密交流，分享文件和想法',
      icon: MessageSquare,
      color: 'from-red-500 to-pink-500',
      href: '/messages'
    },
    {
      title: '占卜系统',
      description: '有趣的占卜功能，为您的文件分享之旅增添乐趣和随机性',
      icon: Sparkles,
      color: 'from-yellow-500 to-orange-500',
      href: '/fortune'
    },
    {
      title: '安全可靠',
      description: '企业级安全防护，确保您的文件和个人信息安全',
      icon: Shield,
      color: 'from-green-500 to-blue-500',
      href: '#'
    }
  ]

  const latestUpdates = [
    {
      status: 'new',
      time: '2小时前',
      title: '新增AI文件分析功能',
      description: '现在可以使用AI智能分析您的文件内容，提供更精准的标签和描述。',
      color: 'bg-green-500'
    },
    {
      status: 'feature',
      time: '1天前',
      title: '私信系统上线',
      description: '全新的私信功能，支持一对一和群组聊天，让交流更加便捷。',
      color: 'bg-blue-500'
    },
    {
      status: 'update',
      time: '3天前',
      title: '性能优化升级',
      description: '大幅提升文件上传和下载速度，优化用户体验。',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <TopAdBanner />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 配置警告 */}
        
        {/* 公告栏 */}
        <AnnouncementBanner />
        
        {/* 主要内容 */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6" style={{
              fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
              fontWeight: 600,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              文件分享平台
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              简单、安全、高效的文件分享服务，让您的文件管理更加便捷
            </p>
            
            {/* 快速操作按钮 */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="btn-elegant flex items-center gap-2"
                >
                  <action.icon className="w-5 h-5" />
                  <span>{action.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 特色功能 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">平台特色功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group card-minimal p-6 hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* 最新动态 */}
        <div className="mb-12">
          <div className="card-minimal p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-slate-600" />
                最新动态
              </h2>
              <Link href="/news" className="text-blue-600 hover:text-blue-700 font-medium">
                查看全部 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestUpdates.map((update, index) => (
                <div key={index} className="p-4 bg-slate-50/50 backdrop-blur-sm rounded-xl border border-slate-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-sm text-slate-500">{update.time}</span>
                  </div>
                  <h3 className="font-medium text-slate-800 mb-1">{update.title}</h3>
                  <p className="text-sm text-slate-600">{update.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 文件网格 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新文件</h2>
            <Link href="/share" className="text-blue-600 hover:text-blue-700 font-medium">
              浏览全部文件 →
            </Link>
          </div>
        <FileGrid />
        </div>
      </main>

      <BottomAdBanner />
    </div>
  )
} 