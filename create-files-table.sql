-- 创建files表的SQL脚本
-- 请在Supabase SQL Editor中运行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建files表
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_is_public ON files(is_public);
CREATE INDEX IF NOT EXISTS idx_files_is_approved ON files(is_approved);

-- 启用RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
DROP POLICY IF EXISTS "Users can view their own files" ON files;
CREATE POLICY "Users can view their own files" ON files
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own files" ON files;
CREATE POLICY "Users can insert their own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own files" ON files;
CREATE POLICY "Users can update their own files" ON files
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own files" ON files;
CREATE POLICY "Users can delete their own files" ON files
  FOR DELETE USING (auth.uid() = user_id);

-- 公开文件可以被所有人查看
DROP POLICY IF EXISTS "Anyone can view public files" ON files;
CREATE POLICY "Anyone can view public files" ON files
  FOR SELECT USING (is_public = true AND is_approved = true);

-- 授予权限
GRANT ALL ON files TO authenticated;

-- 显示创建结果
SELECT 'Files table created successfully!' as status; 