import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createHash } from 'crypto'

// 文件配置
const FILE_CONFIG = {
  maxSize: 3 * 1024 * 1024 * 1024, // 3GB
  allowedTypes: {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
    'audio': ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'],
    'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    'archive': ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    'other': ['application/octet-stream']
  },
  virusScan: false, // 暂时关闭病毒扫描
  compression: false
}

// 速率限制配置
const RATE_LIMIT = {
  maxUploads: 50, // 每分钟最多50个文件
  maxSizePerMinute: 10 * 1024 * 1024 * 1024 // 每分钟最多10GB
}

// 速率限制存储
const RATE_LIMIT_STORE: { [key: string]: { uploads: number[]; totalSize: number; lastReset: number } } = {}

// 检查速率限制
const checkRateLimit = (clientIP: string, fileSize: number) => {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1分钟窗口
  
  if (!RATE_LIMIT_STORE[clientIP]) {
    RATE_LIMIT_STORE[clientIP] = {
      uploads: [],
      totalSize: 0,
      lastReset: now
    }
  }
  
  const userLimit = RATE_LIMIT_STORE[clientIP]
  
  // 重置计数器
  if (now - userLimit.lastReset > windowMs) {
    userLimit.uploads = []
    userLimit.totalSize = 0
    userLimit.lastReset = now
  }
  
  // 检查上传次数限制
  if (userLimit.uploads.length >= RATE_LIMIT.maxUploads) {
    return { allowed: false, error: '上传次数过多，请稍后再试' }
  }
  
  // 检查总大小限制
  if (userLimit.totalSize + fileSize > RATE_LIMIT.maxSizePerMinute) {
    return { allowed: false, error: '上传总大小超限，请稍后再试' }
  }
  
  // 记录本次上传
  userLimit.uploads.push(now)
  userLimit.totalSize += fileSize
  
  return { allowed: true }
}

// 验证文件
const validateFile = (file: File) => {
  // 检查文件大小 - 拒绝 0B 文件
  if (file.size === 0) {
    return { 
      valid: false, 
      error: '不能上传空文件 (0字节)' 
    }
  }
  
  if (file.size > FILE_CONFIG.maxSize) {
    return { 
      valid: false, 
      error: `文件大小超过限制 (${FILE_CONFIG.maxSize / (1024 * 1024 * 1024)}GB)` 
    }
  }
  
  // 检查文件类型
  const isValidType = Object.values(FILE_CONFIG.allowedTypes).flat().some(mimeType => {
    if (mimeType.endsWith('/*')) {
      const baseType = mimeType.replace('/*', '')
      return file.type.startsWith(baseType)
    }
    return file.type === mimeType || mimeType === 'application/octet-stream'
  })
  
  if (!isValidType) {
    return { 
      valid: false, 
      error: '不支持的文件类型' 
    }
  }
  
  return { valid: true }
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  
  // 根据扩展名判断文件类型
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return 'audio'
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document'
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive'
  
  return 'other'
}

function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const hash = createHash('md5').update(`${originalName}${timestamp}${userId}`).digest('hex').substring(0, 8)
  const ext = originalName.split('.').pop()?.toLowerCase() || ''
  
  // 创建用户文件夹路径，格式：userId/timestamp-hash.ext
  return `${userId}/${timestamp}-${hash}.${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const description = formData.get('description') as string
    const isPublic = formData.get('isPublic') === 'true'

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证文件
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // 检查速率限制
    const rateLimitCheck = checkRateLimit(clientIP, file.size)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitCheck.error },
        { status: 429 }
      )
    }

    // 检查用户存储配额（使用服务端，避免RLS）
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('storage_used, storage_limit, username')
      .eq('id', userId)
      .single()

    // 若未找到用户资料，放行上传但跳过配额校验与统计更新
    const allowWithoutProfile = !!userError || !userData

    if (!allowWithoutProfile && userData.storage_used + file.size > userData.storage_limit) {
      return NextResponse.json(
        { success: false, error: '存储空间不足' },
        { status: 413 }
      )
    }

    // 生成文件名
    const fileName = generateFileName(file.name, userId)

    // 根据文件类型选择存储桶
    const bucketName = isPublic ? 'files' : 'files'

    // 上传文件到Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file, { 
        cacheControl: '3600', 
        upsert: false 
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: '文件上传失败' },
        { status: 500 }
      )
    }

    // 获取文件URL
    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(fileName)

    // 计算文件哈希
    const fileBuffer = await file.arrayBuffer()
    const fileHash = createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex')

    // 保存文件信息到数据库
    const { data: fileData, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        original_name: file.name,
        filename: file.name, // 添加filename字段
        file_path: fileName,
        file_size: file.size,
        file_type: getFileType(file.name),
        mime_type: file.type,
        file_hash: fileHash,
        file_url: urlData.publicUrl,
        user_id: userId,
        author_name: userData?.username || 'Unknown',
        description: description || '',
        is_public: isPublic,
        // 分享上传默认待审核，只有在“文件分享上传页”才传 isPublic=true
        is_approved: isPublic ? false : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // 删除已上传的文件
      await supabaseAdmin.storage.from(bucketName).remove([fileName])
      return NextResponse.json(
        { success: false, error: `文件信息保存失败: ${dbError.message}` },
        { status: 500 }
      )
    }

    // 更新用户存储使用量（仅当存在profile时）
    if (!allowWithoutProfile) {
      await supabaseAdmin
        .from('users')
        .update({ storage_used: userData.storage_used + file.size })
        .eq('id', userId)
    }

    const uploadDuration = Date.now() - startTime
    console.log(`File uploaded successfully: ${file.name} (${file.size} bytes) by user ${userId} in ${uploadDuration}ms`)

    return NextResponse.json({
      success: true,
      data: {
        file: fileData,
        url: urlData.publicUrl,
        uploadTime: uploadDuration
      }
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '上传失败' },
      { status: 500 }
    )
  }
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({
    success: true,
    message: '文件上传服务运行正常',
    config: {
      maxFileSize: FILE_CONFIG.maxSize / (1024 * 1024 * 1024) + 'GB',
      allowedTypes: Object.keys(FILE_CONFIG.allowedTypes),
      rateLimit: RATE_LIMIT
    },
    timestamp: new Date().toISOString()
  })
} 