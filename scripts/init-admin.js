const { createClient } = require('@supabase/supabase-js')

// 配置Supabase
const supabaseUrl = 'https://mmnulqhurqohukuobusj.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbnVscWh1cnFvaHVrdW9idXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA4MDYxNiwiZXhwIjoyMDcwNjU2NjE2fQ.04G9dGPJh587IfIFQxdHX8vOBu1azhbuSj-RzeZr2jI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initAdmin() {
  try {
    console.log('开始初始化管理员账号...')
    
    // 检查管理员是否已存在
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', '371920029173')
      .single()
    
    if (existingAdmin) {
      console.log('管理员账号已存在，跳过创建')
      return
    }
    
    // 创建管理员用户
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: '371920029173@admin.local',
      password: '371920029173Abcd',
      email_confirm: true
    })
    
    if (userError) {
      console.error('创建用户失败:', userError)
      return
    }
    
    console.log('用户创建成功:', userData.user.id)
    
    // 创建用户资料
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userData.user.id,
        username: '371920029173',
        email: '371920029173@admin.local',
        nickname_color: '#3B82F6',
        is_admin: true,
        is_moderator: true,
        storage_used: 0,
        storage_limit: 1073741824 // 1GB
      })
    
    if (profileError) {
      console.error('创建用户资料失败:', profileError)
      return
    }
    
    console.log('✅ 管理员账号初始化成功！')
    console.log('用户名: 371920029173')
    console.log('密码: 371920029173Abcd')
    console.log('权限: 管理员 + 审核员')
    
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

// 运行初始化
initAdmin() 