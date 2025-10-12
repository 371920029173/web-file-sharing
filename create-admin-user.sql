-- 创建初始管理员用户
-- 由于删除了所有用户，需要重新创建管理员账户

-- 1. 创建默认管理员用户
INSERT INTO users (
    id,
    username,
    email,
    nickname,
    nickname_color,
    is_admin,
    is_moderator,
    storage_limit,
    storage_used,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@example.com',
    '系统管理员',
    '#FF6B6B',
    true,
    true,
    107374182400, -- 100GB
    0,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- 2. 创建硬编码保护的初始管理员用户
INSERT INTO users (
    id,
    username,
    email,
    nickname,
    nickname_color,
    is_admin,
    is_moderator,
    storage_limit,
    storage_used,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '371920029173',
    '371920029173@example.com',
    '管理员371920029173',
    '#FF6B6B',
    true,
    true,
    107374182400, -- 100GB
    0,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- 3. 创建测试用户
INSERT INTO users (
    id,
    username,
    email,
    nickname,
    nickname_color,
    is_admin,
    is_moderator,
    storage_limit,
    storage_used,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'testuser',
    'test@example.com',
    '测试用户',
    '#4ECDC4',
    false,
    false,
    10737418240, -- 10GB
    0,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- 4. 创建演示用户
INSERT INTO users (
    id,
    username,
    email,
    nickname,
    nickname_color,
    is_admin,
    is_moderator,
    storage_limit,
    storage_used,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'demo',
    'demo@example.com',
    '演示用户',
    '#45B7D1',
    false,
    false,
    10737418240, -- 10GB
    0,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- 5. 验证用户创建
SELECT 
    id,
    username,
    email,
    nickname,
    is_admin,
    is_moderator,
    storage_limit,
    storage_used,
    created_at
FROM users
ORDER BY created_at;

-- 6. 显示用户权限
SELECT 
    username,
    is_admin,
    is_moderator,
    storage_limit / (1024 * 1024 * 1024) as storage_limit_gb
FROM users
ORDER BY is_admin DESC, username; 