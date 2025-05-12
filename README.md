# 旅游日记内容审核平台

一个现代化的Web应用程序，专门用于管理员和审核员对用户发布的旅游日记内容进行审核管理。

## 项目概述

本系统是一个专为旅游平台开发的内容审核后台，主要功能包括对用户发布的旅游日记进行审核、管理和内容质量控制。系统支持多种媒体格式预览，包括图片和视频，并针对不同角色设置了相应的权限控制。

## 角色权限

系统包含三种用户角色，每种角色拥有不同的权限：

- **普通用户(user)**: 无法访问管理后台，仅可在前台应用发布内容
- **审核员(reviewer)**: 可以登录管理后台，审核游记（通过/拒绝），但无删除权限
- **管理员(admin)**: 拥有系统最高权限，可以审核和删除游记

## 核心功能

1. **用户认证**
   - 安全的JWT身份验证
   - 基于角色的权限控制
   - 自动登录状态维持

2. **待审核游记管理**
   - 表格式展示所有待审核游记
   - 详情查看，支持图片/视频预览
   - 一键审核通过/拒绝（需提供拒绝理由）
   - 管理员可直接删除违规内容

3. **已审核游记管理**
   - 卡片式布局展示已审核通过的游记
   - 内容搜索和筛选功能
   - 详情查看和管理

4. **AI辅助审核**
   - 智能内容分析和推荐
   - 自动提供拒绝理由
   - 提高审核效率

5. **我的审核记录**
   - 审核员/管理员个人审核历史记录
   - 审核统计和效率分析

## 技术栈

### 前端
- **React 18.2.0**: 用于构建用户界面的JavaScript库
- **TypeScript 4.9.5**: 类型安全的JavaScript超集
- **Ant Design 5.x**: 企业级UI组件库
- **React Router 7.x**: 前端路由管理
- **Zustand 5.x**: 轻量级状态管理库
- **Axios**: HTTP客户端
- **JWT-Decode**: JWT令牌解析

### 后端通信
- RESTful API
- 标准化响应格式
- 错误处理机制

## 环境要求

- Node.js 16.x或更高版本
- npm 7.x或更高版本
- 现代浏览器支持(Chrome, Firefox, Safari, Edge)

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:8080](http://localhost:8080) 上运行（注意：前端使用8080端口，以避免与后端服务的3000端口冲突）。

### 构建生产版本

```bash
npm run build
```

构建文件将生成在`build`目录下，可部署到任何静态文件服务器。

## API接口

### 基础配置
- 基础URL: `http://localhost:3000/api`
- 认证方式: Bearer Token (JWT)
- 响应格式: JSON

### 主要端点

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| POST | /users/login | 用户登录 | 公开 |
| GET | /users/profile | 获取用户资料 | 已认证 |
| GET | /admin/diaries/pending | 获取待审核游记列表 | reviewer/admin |
| GET | /admin/diaries/approved | 获取已通过游记列表 | reviewer/admin |
| GET | /admin/diaries/rejected | 获取已拒绝游记列表 | reviewer/admin |
| PUT | /admin/diaries/:id/approve | 审核通过游记 | reviewer/admin |
| PUT | /admin/diaries/:id/reject | 拒绝游记 | reviewer/admin |
| DELETE | /admin/diaries/:id | 删除游记 | admin |
| GET | /admin/diaries/:id/ai-review | 获取AI审核结果 | reviewer/admin |

## 数据库结构

本项目后端使用MongoDB数据库，主要集合包括：

- **users**: 用户信息，包含角色权限
- **diaries**: 游记内容，包含审核状态
- **reviews**: 审核记录和历史

## 项目结构

```
src/
  ├── components/        # 共用组件
  ├── layouts/           # 页面布局组件
  ├── pages/             # 页面组件
  │   ├── Login.tsx      # 登录页面
  │   ├── PendingDiaries.tsx  # 待审核游记
  │   ├── ApprovedDiaries.tsx # 已通过游记
  │   ├── RejectedDiaries.tsx # 已拒绝游记
  │   └── MyReviews.tsx  # 我的审核记录
  ├── services/          # API服务
  │   ├── api.ts         # API请求集中管理
  │   └── ...
  ├── store/             # 状态管理
  │   ├── authStore.ts   # 认证状态
  │   ├── diaryStore.ts  # 游记数据状态
  │   └── ...
  ├── types/             # TypeScript类型定义
  │   └── index.ts       # 数据类型定义
  ├── utils/             # 工具函数
  ├── App.tsx            # 应用入口
  └── index.tsx          # 渲染入口
```

## 开发注意事项

1. **跨域问题处理**:
   - 前端和后端运行在不同端口，需要正确配置CORS
   - 后端使用通配符`*`进行CORS配置，移除了`withCredentials: true`设置

2. **端口配置**:
   - 前端默认运行在8080端口
   - 后端默认运行在3000端口
   - 可在`package.json`中修改端口配置

3. **数据格式转换**:
   - 前端使用`id`作为标识符，而MongoDB使用`_id`
   - API响应数据经过映射处理，确保前后端字段一致

4. **权限控制**:
   - 路由守卫确保只有管理员和审核员可以访问后台
   - 组件级权限控制（如删除按钮只对管理员可见）

## 联系与支持

如有问题或建议，请联系项目维护者或提交Issue。
