# 用户列表页面 - Ant Design V6

## 概述

这是一个使用 Ant Design V6 + React + TypeScript 构建的用户列表页面，完全符合项目规范要求。

## 功能特性

- ✅ 用户数据表格展示
- ✅ 搜索功能（支持用户名、邮箱、手机号搜索）
- ✅ 表格排序功能
- ✅ 分页功能（支持自定义每页条数）
- ✅ 响应式布局（使用 Row/Col，gutter 间距 16px）
- ✅ 使用 design token 代替硬编码样式
- ✅ 所有组件用 `<App>` 包裹
- ✅ 表格指定了 rowKey

## 技术栈

- React 18.2.0
- TypeScript 5.2.0
- Ant Design 6.0.0
- Vite 5.0.0

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 访问页面：
打开浏览器访问 `http://localhost:3000/userList.html`

## 项目结构

```
.
├── src/
│   ├── UserList.tsx    # 用户列表组件
│   └── main.tsx        # 应用入口文件
├── userList.html       # HTML 入口文件
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── README_USERLIST.md  # 本文件
```

## 规范遵循

### ✅ 必须遵循
- [x] 使用 React 函数组件 + TypeScript
- [x] 所有组件必须用 `<App>` 包裹
- [x] 使用 design token 代替硬编码样式
- [x] 表格必须指定 rowKey

### ✅ 主题配置
- 主色：`#1677ff`
- 圆角：`6px`
- 组件高度：`32px`

### ✅ 响应式
- 使用 Row/Col 布局
- gutter 间距：`16px`
- 断点：xs(<576) sm(≥576) md(≥768) lg(≥992) xl(≥1200)

### ✅ 组件规范
- Table：指定了 rowKey，pagination 默认开启，添加了 scroll 属性
- Button：支持 loading 状态
- Input：使用 Search 组件，支持搜索功能

## 数据字段说明

用户数据包含以下字段：
- `id`: 用户ID
- `username`: 用户名
- `email`: 邮箱
- `phone`: 手机号
- `level`: 级别
- `role`: 角色（管理员/教师/学生）
- `type`: 类型（VIP/普通/试用）
- `source`: 来源（后台/系统）
- `registerDate`: 注册时间
- `status`: 状态（active/disabled）

## 后续优化建议

1. 添加用户筛选功能（按角色、类型、状态筛选）
2. 添加批量操作功能
3. 添加用户编辑和删除功能
4. 集成真实的 API 接口
5. 添加用户详情查看功能
