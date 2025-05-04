# 旅游日记内容审核平台

一个现代化的管理员后台系统，用于审核用户发布的旅游日记内容。

## 项目功能

- 管理员/审核员登录/登出
- 查看待审核游记列表
- 审核通过/拒绝游记
- 查看已审核游记
- 删除不合规游记（仅管理员）
- 图片和视频预览

## 技术栈

- React 19
- TypeScript
- Ant Design 组件库
- React Router Dom 路由管理
- Zustand 状态管理
- Axios HTTP客户端
- JWT身份验证

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

服务将启动在 [http://localhost:8080](http://localhost:8080)。

### 构建生产版本

```bash
npm run build
```

## API接口

本项目使用RESTful API与后端交互，API文档请参考backend-api.json文件。

### 管理员相关 API

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| GET | /admin/diaries/pending | 获取待审核游记列表 | 审核员/管理员 |
| PUT | /admin/diaries/:id/approve | 审核通过游记 | 审核员/管理员 |
| PUT | /admin/diaries/:id/reject | 拒绝游记 | 审核员/管理员 |
| DELETE | /admin/diaries/:id | 管理员删除游记 | 管理员 |

## 关于数据库

本项目使用MongoDB作为数据库，主要包含以下集合：
- users: 存储用户信息
- diaries: 存储游记信息

用户角色分为三种：
- user: 普通用户
- reviewer: 审核员
- admin: 管理员

管理员和审核员的添加需要在数据库中直接修改用户的role字段。

## 项目结构

```
src/
  ├── components/        # 共用组件
  ├── layouts/           # 页面布局
  ├── pages/             # 页面组件
  ├── services/          # API服务
  ├── store/             # 状态管理
  ├── types/             # TypeScript类型定义
  ├── utils/             # 工具函数
  ├── App.tsx            # 应用入口
  └── index.tsx          # 渲染入口
```

## 功能说明

1. **登录页面**
   - 管理员和审核员用户登录界面

2. **待审核游记**
   - 列表展示所有待审核的旅游日记
   - 可查看详情、通过或拒绝
   - 管理员可删除游记

3. **已审核游记**
   - 卡片式布局展示已审核通过的游记
   - 支持搜索功能
   - 可查看详情，管理员可删除
