-- 数据库设置脚本
-- 运行此脚本前请确保已连接到正确的数据库

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    nickname_color VARCHAR(7) DEFAULT '#3B82F6',
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    storage_limit BIGINT DEFAULT 10737418240, -- 10GB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建文件表
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建对话表
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- 4. 创建消息表
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建公告表
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    author_id UUID REFERENCES users(id),
    author_name VARCHAR(100),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 创建文件访问日志表
CREATE TABLE IF NOT EXISTS file_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(20) NOT NULL, -- 'download', 'view', 'delete'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 创建索引
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_is_public ON files(is_public);
CREATE INDEX IF NOT EXISTS idx_files_is_approved ON files(is_approved);
CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_comments_file_id ON comments(file_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_id ON file_access_logs(file_id);

-- 11. 创建存储使用统计函数
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS TABLE(used_storage BIGINT, storage_limit BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(f.file_size), 0) as used_storage,
        u.storage_limit
    FROM users u
    LEFT JOIN files f ON u.id = f.user_id
    WHERE u.id = user_uuid
    GROUP BY u.id, u.storage_limit;
END;
$$ LANGUAGE plpgsql;

-- 12. 创建文件大小统计函数
CREATE OR REPLACE FUNCTION get_total_file_size()
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE(SUM(file_size), 0) FROM files;
END;
$$ LANGUAGE plpgsql;

-- 13. 创建用户统计函数
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE(total_users BIGINT, total_files BIGINT, total_size BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT f.id) as total_files,
        COALESCE(SUM(f.file_size), 0) as total_size
    FROM users u
    LEFT JOIN files f ON u.id = f.user_id;
END;
$$ LANGUAGE plpgsql;

-- 14. 插入默认系统设置
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('max_file_size', '3221225472', '最大文件大小（字节）'),
('allowed_file_types', 'image/*,video/*,audio/*,application/*,text/*', '允许的文件类型'),
('enable_virus_scan', 'false', '是否启用病毒扫描'),
('enable_compression', 'false', '是否启用文件压缩'),
('max_uploads_per_minute', '50', '每分钟最大上传次数'),
('max_size_per_minute', '10737418240', '每分钟最大上传大小（字节）')
ON CONFLICT (setting_key) DO NOTHING;

-- 15. 创建触发器函数来更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. 为相关表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. 启用行级安全（RLS）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 18. 创建RLS策略
-- 用户表策略
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 文件表策略
DROP POLICY IF EXISTS "Users can view public files" ON files;
CREATE POLICY "Users can view public files" ON files
    FOR SELECT USING (is_public = true AND is_approved = true);

DROP POLICY IF EXISTS "Users can view their own files" ON files;
CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own files" ON files;
CREATE POLICY "Users can manage their own files" ON files
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all files" ON files;
CREATE POLICY "Admins can manage all files" ON files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 对话表策略
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 消息表策略
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- 公告表策略
DROP POLICY IF EXISTS "Everyone can view active announcements" ON announcements;
CREATE POLICY "Everyone can view active announcements" ON announcements
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins and moderators can manage announcements" ON announcements;
CREATE POLICY "Admins and moderators can manage announcements" ON announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true)
        )
    );

-- 评论表策略
DROP POLICY IF EXISTS "Users can view comments on public files" ON comments;
CREATE POLICY "Users can view comments on public files" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM files WHERE id = file_id AND is_public = true AND is_approved = true
        )
    );

DROP POLICY IF EXISTS "Users can manage their own comments" ON comments;
CREATE POLICY "Users can manage their own comments" ON comments
    FOR ALL USING (auth.uid() = user_id);

-- 系统设置表策略
DROP POLICY IF EXISTS "Everyone can view system settings" ON system_settings;
CREATE POLICY "Everyone can view system settings" ON system_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify system settings" ON system_settings;
CREATE POLICY "Only admins can modify system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 19. 创建初始管理员用户（如果不存在）
INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
) ON CONFLICT DO NOTHING;

-- 20. 创建初始管理员用户记录
INSERT INTO users (id, username, email, nickname, is_admin, is_moderator, storage_limit)
SELECT 
    au.id,
    'admin',
    au.email,
    '系统管理员',
    true,
    true,
    107374182400 -- 100GB
FROM auth.users au
WHERE au.email = 'admin@example.com'
ON CONFLICT (username) DO NOTHING;

-- 完成提示
SELECT '数据库设置完成！' as status; 