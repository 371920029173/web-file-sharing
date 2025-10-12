-- 修复消息表结构，确保所有字段都存在
-- 在Supabase SQL编辑器中运行

-- 1. 检查并添加缺失的字段
DO $$ 
BEGIN
    -- 添加 message_type 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'message_type') THEN
        ALTER TABLE public.messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';
    END IF;

    -- 添加 file_url 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'file_url') THEN
        ALTER TABLE public.messages ADD COLUMN file_url TEXT;
    END IF;

    -- 添加 file_name 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'file_name') THEN
        ALTER TABLE public.messages ADD COLUMN file_name TEXT;
    END IF;

    -- 添加 file_type 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'file_type') THEN
        ALTER TABLE public.messages ADD COLUMN file_type TEXT;
    END IF;

    -- 添加 file_size 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'file_size') THEN
        ALTER TABLE public.messages ADD COLUMN file_size BIGINT;
    END IF;

    -- 添加 mime_type 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'mime_type') THEN
        ALTER TABLE public.messages ADD COLUMN mime_type TEXT;
    END IF;

    -- 添加 created_at 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'created_at') THEN
        ALTER TABLE public.messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- 添加 updated_at 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'updated_at') THEN
        ALTER TABLE public.messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- 添加 is_recalled 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'is_recalled') THEN
        ALTER TABLE public.messages ADD COLUMN is_recalled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. 确保索引存在
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at);

-- 3. 确保RLS策略正确
-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "用户可以查看自己的消息" ON public.messages;
DROP POLICY IF EXISTS "用户可以发送消息" ON public.messages;
DROP POLICY IF EXISTS "用户可以更新自己的消息" ON public.messages;

-- 创建新的RLS策略
CREATE POLICY "用户可以查看自己的消息" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "用户可以发送消息" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "用户可以更新自己的消息" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- 4. 确保对话表也有正确的字段
DO $$ 
BEGIN
    -- 添加 title 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'title') THEN
        ALTER TABLE public.conversations ADD COLUMN title TEXT;
    END IF;

    -- 添加 updated_at 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'conversations' AND column_name = 'updated_at') THEN
        ALTER TABLE public.conversations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 5. 确保对话表的RLS策略正确
DROP POLICY IF EXISTS "用户可以查看自己的对话" ON public.conversations;
DROP POLICY IF EXISTS "用户可以创建对话" ON public.conversations;

CREATE POLICY "用户可以查看自己的对话" ON public.conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "用户可以创建对话" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "用户可以更新自己的对话" ON public.conversations
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 6. 验证表结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('messages', 'conversations')
ORDER BY table_name, ordinal_position;
