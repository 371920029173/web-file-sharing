import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // 构建查询条件
    // 使用管理端绕过RLS，保证可取到作者id等信息
    let query = supabaseAdmin
      .from('files')
      .select('*')
      .eq('is_public', true)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    // 添加搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 添加类型筛选
    if (type && type !== 'all') {
      query = query.eq('file_type', type)
    }

    // 添加分页
    query = query.range(offset, offset + limit - 1)

    const { data: files, error, count } = await query

    if (error) {
      console.error('Error fetching public files:', error)
      return NextResponse.json(
        { success: false, error: '获取文件列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      files: files || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Public files API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
} 