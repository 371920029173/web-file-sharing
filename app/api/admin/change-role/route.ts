import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 普通管理员发起对其它管理员的角色变更申请，由超级管理员审批
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: '未认证' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ success: false, error: '认证失败' }, { status: 401 })

    const { target_user_id, action, reason } = await request.json()
    if (!target_user_id || !action) return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })

    const { data, error } = await supabase.from('admin_change_requests').insert({
      requester_id: user.id,
      target_user_id,
      action,
      status: 'pending',
      reason
    }).select('*').single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error('提交管理员变更申请失败:', e)
    return NextResponse.json({ success: false, error: e.message || '提交失败' }, { status: 500 })
  }
}

// 超级管理员审批
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: '未认证' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ success: false, error: '认证失败' }, { status: 401 })

    // 简化：用户名为超级管理员账号
    const { data: me } = await supabase.from('users').select('username').eq('id', user.id).single()
    if (me?.username !== '371920029173') return NextResponse.json({ success: false, error: '只有超级管理员可审批' }, { status: 403 })

    const { id, approve } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: '缺少请求ID' }, { status: 400 })

    const status = approve ? 'approved' : 'rejected'
    const { data: updated, error } = await supabase.from('admin_change_requests')
      .update({ status, super_admin_id: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id).select('*').single()
    if (error) throw error

    if (status === 'approved') {
      if (updated.action === 'promote') {
        await supabase.from('users').update({ is_admin: true }).eq('id', updated.target_user_id)
      } else if (updated.action === 'demote') {
        await supabase.from('users').update({ is_admin: false }).eq('id', updated.target_user_id)
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (e: any) {
    console.error('审批管理员变更失败:', e)
    return NextResponse.json({ success: false, error: e.message || '审批失败' }, { status: 500 })
  }
}


