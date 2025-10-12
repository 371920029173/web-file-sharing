# 问题修复操作指南

## 当前问题总结

1. **公告发布失败**：缺少必要参数 - ✅ 已修复
2. **云盘存储失败**：Row Level Security (RLS) 策略问题 - ⚠️ 需要手动修复
3. **文件分享上传失败**：500 内部服务器错误 - ⚠️ 需要手动修复
4. **聊天系统错误**：外键关系问题 - ✅ 已修复
5. **存储管理页面空白**：API 调用问题 - ⚠️ 需要手动修复

## 修复步骤

### 第一步：修复私信系统（已完成）

**问题**：私信系统出现外键关系错误和参数不匹配问题

**已修复内容**：
1. **参数匹配问题**：前端发送 `otherUserId`，后端期望 `receiverId`
2. **外键依赖问题**：移除对 `conversations_user1_id_fkey` 等外键约束名称的依赖
3. **API重构**：重写私信发送和对话列表API，使用简单的查询方式

**修复文件**：
- `app/api/messages/send/route.ts` - 完全重写
- `app/api/messages/conversations/route.ts` - 移除外键依赖

### 第二步：修复 Supabase Storage RLS 策略

**问题**：文件上传时出现 "new row violates row-level security policy" 错误

**解决方案**：在 Supabase Dashboard 中运行 SQL 脚本

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 创建新的查询
5. 复制并粘贴 `simple-rls-fix.sql` 文件中的内容
6. 点击 "Run" 执行脚本

**预期结果**：应该看到 "RLS policies created successfully" 等成功消息

### 第二步：验证存储桶配置

**检查项目**：
1. 在 Supabase Dashboard 中点击 "Storage"
2. 确认以下存储桶存在且配置正确：
   - `cloud-drive` (私有)
   - `file-share` (公开)
   - `announcements` (可选)

**存储桶设置**：
- 确保 RLS (Row Level Security) 已启用
- 文件大小限制设置为 50MB (符合免费版限制)

### 第三步：测试功能

**测试顺序**：
1. **公告系统**：尝试发布新公告
2. **云盘功能**：上传文件到云盘
3. **文件分享**：上传文件到文件分享
4. **聊天系统**：创建新对话
5. **存储管理**：查看用户存储情况

## 如果问题仍然存在

### 方案 A：完全重置 RLS 策略

如果简化策略仍有问题，可以尝试完全禁用 RLS：

```sql
-- 在 Supabase SQL Editor 中运行
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**注意**：这会降低安全性，仅用于测试

### 方案 B：检查存储桶权限

在 Supabase Dashboard 中：
1. 进入 Storage > Policies
2. 确认每个存储桶都有正确的策略
3. 如果没有策略，手动创建或使用上述 SQL 脚本

### 方案 C：检查用户认证

确保：
1. 用户已正确登录
2. `auth.uid()` 返回正确的用户 ID
3. 用户有相应的权限

## 常见错误及解决方案

### 错误 1：RLS 策略冲突
```
new row violates row-level security policy
```
**解决**：运行 `simple-rls-fix.sql` 脚本

### 错误 2：外键约束失败
```
Could not find a relationship between 'conversations' and 'users'
```
**解决**：运行 `simple-rls-fix.sql` 脚本中的外键修复部分

### 错误 3：存储桶不存在
```
bucket not found
```
**解决**：在 Supabase Dashboard 中创建相应的存储桶

### 错误 4：权限不足
```
permission denied
```
**解决**：检查用户角色和 RLS 策略

## 验证修复成功

修复完成后，应该能够：
- ✅ 成功发布公告
- ✅ 上传文件到云盘
- ✅ 上传文件到文件分享
- ✅ 创建聊天对话
- ✅ 查看存储管理页面

## 联系支持

如果问题仍然存在，请：
1. 检查 Supabase Dashboard 中的错误日志
2. 确认所有 SQL 脚本执行成功
3. 提供具体的错误信息和截图 