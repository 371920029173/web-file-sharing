import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取用户ID
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // 验证token并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const userId = user.id

    // 获取用户的对话列表 - 使用简单的查询，不依赖外键约束名称
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        user1_id,
        user2_id,
        title,
        last_message_at,
        created_at,
        updated_at
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('获取对话列表失败:', error)
      throw error
    }

    // 获取对话中的用户信息和最后消息
    const processedConversations = []
    
    for (const conv of conversations || []) {
      try {
        // 获取其他用户信息（不是当前用户）
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
        const { data: otherUser, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, username, nickname, nickname_color')
          .eq('id', otherUserId)
          .single()

        if (userError) {
          console.error(`获取用户 ${otherUserId} 信息失败:`, userError)
          continue
        }

        // 获取最后一条消息
        const { data: lastMessage, error: msgError } = await supabaseAdmin
          .from('messages')
          .select('content, sent_at')
          .eq('conversation_id', conv.id)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single()

        if (msgError && msgError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error(`获取对话 ${conv.id} 最后消息失败:`, msgError)
        }

        // 确保显示的是其他用户的用户名，而不是当前用户
        const displayUsername = otherUser.nickname || otherUser.username || 'Unknown'
        
        console.log(`对话 ${conv.id} 的用户信息:`, {
          currentUserId: userId,
          otherUserId: otherUserId,
          otherUserData: otherUser,
          displayUsername: displayUsername
        })
        
        processedConversations.push({
          id: conv.id,
          other_user: {
            id: otherUser.id,
            username: otherUser.username,
            nickname: otherUser.nickname,
            nickname_color: otherUser.nickname_color
          },
          last_message: lastMessage || null,
          last_message_at: conv.last_message_at,
          title: conv.title
        })
      } catch (error) {
        console.error(`处理对话 ${conv.id} 失败:`, error)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      conversations: processedConversations
    })

  } catch (error: any) {
    console.error('获取对话列表失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取失败' },
      { status: 500 }
    )
  }
} 