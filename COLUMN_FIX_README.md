# 数据库列名修复说明

## 问题描述
当前系统存在数据库列名不一致的问题：
- `database-setup-fixed.sql` 中 `files` 表使用 `author_id`
- 其他脚本和代码中使用 `user_id`
- 导致 `ERROR: 42703: column "author_id" does not exist` 错误

## 根本原因
数据库表结构定义不一致，代码中混合使用了两种列名：
1. `author_id` - 在部分数据库脚本中定义
2. `user_id` - 在大部分代码和脚本中使用

## 修复方法

### 步骤1：运行列名修复脚本
1. 登录Supabase Dashboard
2. 进入SQL Editor
3. 复制并运行 `fix-column-names.sql` 文件中的所有内容
4. 等待脚本执行完成

### 步骤2：运行RLS策略修复脚本
1. 在同一个SQL Editor中
2. 复制并运行 `comprehensive-rls-fix.sql` 文件中的所有内容
3. 等待脚本执行完成

## 修复内容

### 列名统一
- 将 `files.author_id` 重命名为 `files.user_id`
- 将 `announcements.author_id` 重命名为 `announcements.user_id`
- 确保所有表都使用 `user_id` 列名

### 索引更新
- 删除旧的 `idx_files_author_id` 索引
- 创建新的 `idx_files_user_id` 索引
- 更新相关表的索引

### RLS策略修复
- 删除基于 `author_id` 的旧策略
- 创建基于 `user_id` 的新策略
- 确保权限控制正常工作

## 验证修复

### 检查列名
```sql
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('files', 'announcements')
AND column_name = 'user_id';
```

### 检查RLS策略
```sql
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'files'
ORDER BY policyname;
```

## 注意事项
- 修复前建议备份数据库
- 修复后需要重启应用
- 如果仍有问题，检查是否有其他表存在列名不一致

## 相关文件
- `fix-column-names.sql` - 列名修复脚本
- `comprehensive-rls-fix.sql` - RLS策略修复脚本
- `database-setup-fixed.sql` - 原始数据库设置脚本

## 预期结果
修复完成后：
- ✅ 不再出现 `column "author_id" does not exist` 错误
- ✅ 用户注册和登录功能正常
- ✅ 文件上传和管理功能正常
- ✅ 聊天搜索功能正常
- ✅ RLS权限控制正常工作 