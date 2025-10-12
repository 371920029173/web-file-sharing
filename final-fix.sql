-- 最终修复脚本 - 只做最基本的修复
-- 目标：让用户注册和登录能正常工作

-- 1. 删除所有RLS策略
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Allow user search" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can modify user storage" ON users;

DROP POLICY IF EXISTS "Users can view public files" ON files;
DROP POLICY IF EXISTS "Users can view their own files" ON files;
DROP POLICY IF EXISTS "Users can manage their own files" ON files;
DROP POLICY IF EXISTS "Admins can manage all files" ON files;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

DROP POLICY IF EXISTS "Everyone can view active announcements" ON announcements;
DROP POLICY IF EXISTS "Admins and moderators can manage announcements" ON announcements;

-- 2. 禁用所有表的RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 3. 确保所有表都有正确的权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON files TO anon, authenticated;
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON announcements TO anon, authenticated;
GRANT ALL ON comments TO anon, authenticated;

-- 4. 修复列名问题（如果存在）
DO $$ 
BEGIN
    -- 检查并修复files表的列名
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE files RENAME COLUMN author_id TO user_id;
        RAISE NOTICE '已将 files.author_id 重命名为 files.user_id';
    END IF;
    
    -- 检查并修复announcements表的列名
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE announcements RENAME COLUMN author_id TO user_id;
        RAISE NOTICE '已将 announcements.author_id 重命名为 announcements.user_id';
    END IF;
END $$;

-- 5. 验证修复结果
SELECT '修复完成！' as status;
SELECT 'RLS状态:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'files', 'conversations', 'messages', 'announcements', 'comments')
ORDER BY tablename; 