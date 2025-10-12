'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/supabase'

// 硬编码的初始管理员用户名，无法被其他管理员修改
const INITIAL_ADMIN_USERNAME = '371920029173'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signUp: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // 简化的登录函数
  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true)
      console.log('开始登录流程,用户名:', username)
      
      // 检查Supabase连接
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase未配置')
      }

      // 直接查找用户资料
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError || !userProfile) {
        console.error('用户不存在:', profileError)
        throw new Error('用户不存在，请先注册')
      }

      console.log('找到用户资料:', userProfile)

      // 使用用户资料中的邮箱进行登录
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userProfile.email,
        password: password
      })

      if (authError) {
        console.error('登录失败:', authError)
        throw new Error(`登录失败: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('登录后未返回用户数据')
      }

      console.log('登录成功,用户ID:', authData.user.id)
      
      // 设置用户状态
      setUser(userProfile)
      setLoading(false)

    } catch (error: any) {
      console.error('登录过程中的完整错误:', error)
      setLoading(false)
      throw error
    }
  }

  // 简化的注册函数
  const signUp = async (username: string, password: string) => {
    try {
      setLoading(true)
      console.log('开始注册流程,用户名:', username)
      
      // 检查Supabase连接
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase未配置')
      }

      // 检查用户名是否已存在
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        throw new Error('用户名已存在，请选择其他用户名')
      }

      // 使用固定的邮箱格式，确保一致性
      const email = `${username}@fileshare.local`
      console.log('使用固定邮箱:', email)

      // 先创建用户资料
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          username: username,
          email: email,
          nickname: username,
          nickname_color: '#3B82F6',
          is_admin: username === INITIAL_ADMIN_USERNAME,
          is_moderator: username === INITIAL_ADMIN_USERNAME,
          storage_used: 0,
          storage_limit: username === INITIAL_ADMIN_USERNAME ? 107374182400 : 1073741824
        })
        .select()
        .single()

      if (profileError) {
        console.error('用户资料创建失败:', profileError)
        throw new Error('用户资料创建失败')
      }

      console.log('用户资料创建成功:', profileData)

      // 然后注册认证账户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            user_id: profileData.id
          }
        }
      })

      if (authError) {
        console.error('认证账户创建失败:', authError)
        // 删除已创建的用户资料
        await supabase.from('users').delete().eq('id', profileData.id)
        throw new Error(`认证账户创建失败: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('注册后未返回用户数据')
      }

      console.log('注册完全成功,用户ID:', profileData.id)
      
      // 设置用户状态
      setUser(profileData)
      setLoading(false)

    } catch (error: any) {
      console.error('注册过程中的完整错误:', error)
      setLoading(false)
      throw error
    }
  }

  // 简化的登出函数
  const signOut = async () => {
    try {
      setLoading(true)
      
      if (supabase) {
        await supabase.auth.signOut()
      }
      
      setUser(null)
      setLoading(false)
      console.log('登出成功')
      
    } catch (error) {
      console.error('登出失败:', error)
      setLoading(false)
      // 即使登出失败，也清除本地状态
      setUser(null)
    }
  }

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      if (!user?.id) return
      
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileError && userProfile) {
        setUser(userProfile)
        console.log('用户信息已刷新')
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  // 简化的会话检查
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        
        if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          console.log('Supabase未配置，跳过会话检查')
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('找到现有会话，用户ID:', session.user.id)
          
          // 尝试获取用户资料
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError || !userProfile) {
            console.log('无法获取用户资料，但不清除会话，尝试重新获取')
            // 不立即清除会话，而是尝试重新获取
            // 可能是网络问题或临时数据库问题
            setUser(null)
          } else {
            console.log('恢复用户状态:', userProfile.username)
            setUser(userProfile)
          }
        } else {
          console.log('没有找到现有会话')
          setUser(null)
        }
        
      } catch (error: any) {
        console.error('会话检查失败:', error)
        // 网络错误时不清除用户状态
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          console.log('网络错误，保持当前用户状态')
        } else {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // 设置会话监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // 用户登录
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userProfile) {
            setUser(userProfile)
          }
        } else if (event === 'SIGNED_OUT') {
          // 用户登出
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token刷新，重新获取用户信息
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userProfile) {
            setUser(userProfile)
          }
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 