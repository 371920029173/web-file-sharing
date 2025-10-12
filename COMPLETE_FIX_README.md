# 完整修复说明

## 当前问题总结
1. **列名不一致**：`author_id` vs `user_id`
2. **类型转换错误**：`text = uuid` 类型不匹配
3. **RLS策略问题**：权限控制失效
4. **用户数据缺失**：所有用户被删除

## 修复步骤

### 步骤1：安全修复列名不一致
运行 `safe-fix-column-names.sql` 脚本：
- 统一使用 `user_id` 列名
- 更新相关索引
- **暂时禁用RLS**，避免策略问题

### 步骤2：修复类型转换问题
运行 `fix-type-conversion.sql` 脚本：
- 确保所有ID列都是UUID类型
- 修复RLS策略中的类型转换
- 重新创建正确的权限策略

### 步骤3：创建初始用户
运行 `create-admin-user.sql` 脚本：
- 管理员：`admin` / `admin@example.com`
- **硬编码保护账户**：`371920029173` / `371920029173Abcd`
- 测试用户：`testuser` / `test@example.com`
- 演示用户：`demo` / `demo@example.com`

## 执行顺序

**重要：必须按顺序执行！**

1. **首先运行** `safe-fix-column-names.sql` （安全版本，避免类型错误）
2. **然后运行** `fix-type-conversion.sql`
3. **最后运行** `create-admin-user.sql`

## 为什么使用安全版本？

原始的 `fix-column-names.sql` 在RLS策略中使用了 `auth.uid()::text = user_id`，这会导致：
- `ERROR: 42883: operator does not exist: text = uuid`
- 因为 `user_id` 是UUID类型，不需要转换为text

`safe-fix-column-names.sql` 会：
- 修复列名问题
- 暂时禁用RLS，避免策略错误
- 让后续的类型转换修复脚本能够正常工作

## 验证修复

### 检查列名
```sql
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'files', 'conversations', 'messages', 'announcements')
AND column_name LIKE '%user_id%'
ORDER BY table_name, column_name;
```

### 检查用户
```sql
SELECT 
    username,
    email,
    is_admin,
    is_moderator
FROM users
ORDER BY is_admin DESC, username;
```

### 检查RLS策略
```sql
SELECT 
    tablename, 
    policyname, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('users', 'files')
ORDER BY tablename, policyname;
```

## 预期结果

修复完成后：
- ✅ 不再出现列名错误
- ✅ 不再出现类型转换错误
- ✅ 用户注册和登录正常
- ✅ 文件上传和管理正常
- ✅ 聊天搜索功能正常
- ✅ 管理员后台正常
- ✅ RLS权限控制正常

## 测试账户

### 硬编码保护账户（重要）
- 用户名：`371920029173`
- 密码：`371920029173Abcd`
- 权限：完全管理员权限
- 存储空间：100GB
- **说明**：这个账户在代码中有硬编码保护，无法被其他管理员修改

### 默认管理员账户
- 用户名：`admin`
- 邮箱：`admin@example.com`
- 权限：完全管理员权限
- 存储空间：100GB

### 测试账户
- 用户名：`testuser`
- 邮箱：`test@example.com`
- 权限：普通用户
- 存储空间：10GB

### 演示账户
- 用户名：`demo`
- 邮箱：`demo@example.com`
- 权限：普通用户
- 存储空间：10GB

## 注意事项

1. **备份数据库**：修复前建议备份
2. **按顺序执行**：脚本必须按指定顺序运行
3. **使用安全版本**：第一步使用 `safe-fix-column-names.sql`
4. **重启应用**：修复完成后重启开发服务器
5. **测试功能**：逐一测试各项功能是否正常

## 如果仍有问题

如果修复后仍有问题，请检查：
1. 脚本是否按顺序执行完成
2. 是否有SQL错误信息
3. 数据库连接是否正常
4. 环境变量配置是否正确

## 相关文件

- `safe-fix-column-names.sql` - 安全的列名修复脚本（推荐）
- `fix-column-names.sql` - 原始列名修复脚本（有类型转换问题）
- `fix-type-conversion.sql` - 类型转换修复脚本
- `create-admin-user.sql` - 创建初始用户
- `comprehensive-rls-fix.sql` - RLS策略修复（备用） 