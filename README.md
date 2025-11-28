<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 智能文献助手 - Smart Paper Assistant

一个基于 AI 的智能论文参考文献助手，可以自动提取 PDF 论文中的参考文献列表，并一键搜索摘要及全文链接。

View your app in AI Studio: https://ai.studio/apps/drive/1qbgrmcuVj6igu1vrCfCGdclEJM-DgxVj

## ✨ 功能特性

- 📄 自动提取 PDF 论文的参考文献列表
- 🔍 智能搜索论文摘要和来源链接
- 🛡️ API Key 安全保护（通过 Serverless Functions）
- ⚡ 快速响应，基于 Gemini 2.5 Flash 模型

## 🏗️ 技术架构

```
前端 (React + Vite)
    ↓
Serverless Functions (/api)
    ↓
Google Gemini API
```

**安全设计：** API Key 存储在服务器端环境变量中，前端代码无法访问，有效保护您的 API Key 安全。

## 🚀 本地运行

**前置要求：** Node.js 18+

1. **安装依赖：**
   ```bash
   npm install
   ```

2. **配置环境变量：**
   
   创建 `.env.local` 文件并设置你的 Gemini API Key：
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **启动开发服务器：**
   ```bash
   npm run dev
   ```

4. 打开浏览器访问 `http://localhost:3000`

## 📦 部署到 Vercel

### 方式 1：通过 Vercel CLI

1. **安装 Vercel CLI：**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel：**
   ```bash
   vercel login
   ```

3. **部署：**
   ```bash
   vercel
   ```

4. **设置环境变量：**
   在 Vercel 控制台中添加环境变量：
   - Key: `GEMINI_API_KEY`
   - Value: 你的 Gemini API Key

### 方式 2：通过 Vercel Dashboard

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中导入项目
3. 在项目设置中添加环境变量：
   - `GEMINI_API_KEY` = 你的 API Key
4. 点击部署

## 🔒 安全说明

- ✅ API Key 存储在服务器端，不会暴露给客户端
- ✅ 所有 AI 请求通过后端 Serverless Functions 代理
- ✅ 前端代码中不包含任何敏感信息
- ✅ 环境变量在构建时不会被打包进前端代码

## 📁 项目结构

```
/SmartPaper
├── api/                        # Vercel Serverless Functions
│   ├── extract-references.ts   # PDF 参考文献提取 API
│   └── search-reference.ts     # 在线搜索 API
├── app/                        
├── components/                 # React 组件
├── services/                   
│   └── geminiService.ts        # 前端 API 调用服务
├── types.ts                    # TypeScript 类型定义
├── App.tsx                     # 主应用组件
├── vite.config.ts              # Vite 配置
├── vercel.json                 # Vercel 配置
└── .env.local                  # 本地环境变量（不提交到 Git）
```

## 🛠️ 开发

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建

## 📝 License

MIT
