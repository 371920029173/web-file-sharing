-- 创建存储管理日志表
-- 用于记录管理员对用户存储空间的调整操作

-- 1. 先删除表（如果存在）
DROP TABLE IF EXISTS storage_management_logs CASCADE;

-- 2. 创建新表
CREATE TABLE storage_management_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL DEFAULT 'set_storage',
  old_limit BIGINT NOT NULL,
  new_limit BIGINT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 添加外键约束（如果users表存在）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE storage_management_logs 
    ADD CONSTRAINT fk_storage_logs_admin_id 
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;
    
    ALTER TABLE storage_management_logs 
    ADD CONSTRAINT fk_storage_logs_target_user_id 
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. 创建索引
CREATE INDEX idx_storage_logs_admin_id ON storage_management_logs(admin_id);
CREATE INDEX idx_storage_logs_target_user_id ON storage_management_logs(target_user_id);
CREATE INDEX idx_storage_logs_created_at ON storage_management_logs(created_at);

-- 5. 添加一些测试数据
INSERT INTO storage_management_logs (admin_id, target_user_id, action, old_limit, new_limit, reason)
SELECT 
  admin.id,
  user.id,
  'initial_setup',
  user.storage_limit,
  user.storage_limit,
  '系统初始化'
FROM users admin, users user
WHERE admin.username = '371920029173' 
  AND admin.is_admin = true
  AND user.username != '371920029173'
LIMIT 5;

-- 6. 检查表是否创建成功
SELECT '=== 存储管理日志表状态 ===' as info;
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'storage_management_logs'
ORDER BY ordinal_position;

-- 7. 显示表数据
SELECT '=== 表数据检查 ===' as info;
SELECT COUNT(*) as total_logs FROM storage_management_logs;

SELECT '✅ 存储管理日志表创建完成' as message; 