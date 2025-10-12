// 配置管理
export interface AppConfig {
  // 基础配置
  app: {
    name: string
    version: string
    url: string
    environment: string
  }
  
  // 数据库配置
  database: {
    url: string
    poolSize: number
    timeout: number
  }
  
  // 文件上传配置
  upload: {
    maxFileSize: number
    rateLimit: number
    rateLimitWindow: number
    maxFilesPerUser: number
    allowedTypes: string[]
  }
  
  // 安全配置
  security: {
    jwtSecret: string
    encryptionKey: string
    sessionSecret: string
    csrfSecret: string
    rateLimitEnabled: boolean
    rateLimitWindow: number
    rateLimitMaxRequests: number
  }
  
  // AI服务配置
  ai: {
    openai: {
      apiKey: string
      organization?: string
      enabled: boolean
    }
    claude: {
      apiKey: string
      enabled: boolean
    }
    gemini: {
      apiKey: string
      enabled: boolean
    }
  }
  
  // 第三方服务配置
  services: {
    virusTotal: {
      apiKey: string
      enabled: boolean
    }
    cloudinary: {
      url: string
      cloudName: string
      apiKey: string
      apiSecret: string
      enabled: boolean
    }
    email: {
      host: string
      port: number
      user: string
      pass: string
      from: string
      enabled: boolean
    }
  }
  
  // 功能开关
  features: {
    aiChat: boolean
    privateMessages: boolean
    filePreview: boolean
    userAnalytics: boolean
    adminPanel: boolean
    moderation: boolean
  }
  
  // 监控配置
  monitoring: {
    sentryDsn: string
    logLevel: string
    logFormat: string
    enableMetrics: boolean
    metricsPort: number
  }
}

// 验证配置
function validateConfig(config: AppConfig): string[] {
  const errors: string[] = []
  
  // 验证必需配置
  if (!config.database.url) {
    errors.push('DATABASE_URL is required')
  }
  
  if (!config.security.jwtSecret) {
    errors.push('JWT_SECRET is required')
  }
  
  if (!config.security.encryptionKey) {
    errors.push('ENCRYPTION_KEY is required')
  }
  
  // 验证AI服务配置
  if (config.features.aiChat) {
    const hasAIService = config.ai.openai.enabled || config.ai.claude.enabled || config.ai.gemini.enabled
    if (!hasAIService) {
      errors.push('At least one AI service must be enabled when AI chat is enabled')
    }
  }
  
  // 验证文件上传配置
  if (config.upload.maxFileSize <= 0) {
    errors.push('MAX_FILE_SIZE must be greater than 0')
  }
  
  if (config.upload.rateLimit <= 0) {
    errors.push('UPLOAD_RATE_LIMIT must be greater than 0')
  }
  
  return errors
}

// 创建配置对象
export function createConfig(): AppConfig {
  const config: AppConfig = {
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || '文件分享平台',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      environment: process.env.NODE_ENV || 'development'
    },
    
    database: {
      url: process.env.DATABASE_URL || '',
      poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
      timeout: parseInt(process.env.DATABASE_TIMEOUT || '30000')
    },
    
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'),
      rateLimit: parseInt(process.env.UPLOAD_RATE_LIMIT || '10'),
      rateLimitWindow: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW || '60000'),
      maxFilesPerUser: parseInt(process.env.MAX_FILES_PER_USER || '1000'),
      allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image,video,audio,document,archive,code').split(',')
    },
    
    security: {
      jwtSecret: process.env.JWT_SECRET || '',
      encryptionKey: process.env.ENCRYPTION_KEY || '',
      sessionSecret: process.env.SESSION_SECRET || '',
      csrfSecret: process.env.CSRF_SECRET || '',
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED === 'true',
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    },
    
    ai: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        organization: process.env.OPENAI_ORGANIZATION,
        enabled: !!process.env.OPENAI_API_KEY
      },
      claude: {
        apiKey: process.env.CLAUDE_API_KEY || '',
        enabled: !!process.env.CLAUDE_API_KEY
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        enabled: !!process.env.GEMINI_API_KEY
      }
    },
    
    services: {
      virusTotal: {
        apiKey: process.env.VIRUSTOTAL_API_KEY || '',
        enabled: !!process.env.VIRUSTOTAL_API_KEY
      },
      cloudinary: {
        url: process.env.CLOUDINARY_URL || '',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
        enabled: !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
      },
      email: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || '',
        enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
      }
    },
    
    features: {
      aiChat: process.env.FEATURE_AI_CHAT === 'true',
      privateMessages: process.env.FEATURE_PRIVATE_MESSAGES === 'true',
      filePreview: process.env.FEATURE_FILE_PREVIEW === 'true',
      userAnalytics: process.env.FEATURE_USER_ANALYTICS === 'true',
      adminPanel: process.env.FEATURE_ADMIN_PANEL === 'true',
      moderation: process.env.FEATURE_MODERATION === 'true'
    },
    
    monitoring: {
      sentryDsn: process.env.SENTRY_DSN || '',
      logLevel: process.env.LOG_LEVEL || 'info',
      logFormat: process.env.LOG_FORMAT || 'json',
      enableMetrics: process.env.ENABLE_METRICS === 'true',
      metricsPort: parseInt(process.env.METRICS_PORT || '9090')
    }
  }
  
  return config
}

// 获取配置实例
export const config = createConfig()

// 验证配置
export function validateAppConfig(): { isValid: boolean; errors: string[] } {
  const errors = validateConfig(config)
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 获取环境信息
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  }
}

// 检查功能是否启用
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return config.features[feature]
}

// 检查AI服务是否可用
export function isAIServiceAvailable(service: keyof AppConfig['ai']): boolean {
  return config.ai[service].enabled
}

// 获取配置摘要（用于调试，不包含敏感信息）
export function getConfigSummary() {
  return {
    app: config.app,
    environment: getEnvironmentInfo(),
    features: config.features,
    aiServices: {
      openai: config.ai.openai.enabled,
      claude: config.ai.claude.enabled,
      gemini: config.ai.gemini.enabled
    },
    upload: {
      maxFileSize: `${config.upload.maxFileSize / (1024 * 1024)}MB`,
      rateLimit: config.upload.rateLimit,
      allowedTypes: config.upload.allowedTypes
    }
  }
} 