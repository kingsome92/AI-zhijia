# 智加本智能AI管理后台

智能AI管理后台系统，提供完整的AI资源管理和配置功能。

## 📋 项目功能

- **资源管理** (Resource Management)
- **用户管理** (User Management)
- **账户管理** (Account Management)
- **会话历史** (Session History)
- **会话主题** (Session Theme)
- **模型配置** (Model Configuration)
- **MCP服务** (MCP Service)
- **数据加工** (Data Processing)
- **任务列表** (Task List)
- **流量统计** (Traffic Statistics)
- **系统日志** (System Logs)
- **系统设置** (System Settings)
- **仪表板** (Dashboard)

## 🚀 快速开始

### 本地运行

直接在浏览器中打开 `index.html` 文件即可。

### 部署到 GitHub Pages

1. **确保已安装 Git**
   - 下载地址：https://git-scm.com/downloads

2. **初始化仓库（如果还没有）**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **创建 GitHub 仓库**
   - 访问 https://github.com
   - 点击右上角 "+" → "New repository"
   - 填写仓库名称（例如：`zhijiaben-ai-admin`）
   - 选择 Public（公开仓库）
   - 不要勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

4. **连接并推送**
   ```bash
   git remote add origin https://github.com/您的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

5. **启用 GitHub Pages**
   - 在 GitHub 仓库页面，点击 **Settings**
   - 在左侧菜单找到 **Pages**
   - Source: 选择 `main` 分支
   - Folder: 选择 `/ (root)`
   - 点击 **Save**

6. **访问网站**
   - 等待几分钟后，访问：`https://您的用户名.github.io/仓库名/`

## 📁 项目结构

```
智加本智能AI管理后台/
├── index.html                    # 主入口文件
├── dashboard.html                # 仪表板
├── resourceManagement.html      # 资源管理
├── userManagement.html          # 用户管理
├── accountManagement.html        # 账户管理
├── sessionHistory.html          # 会话历史
├── sessionTheme.html            # 会话主题
├── modelConfiguration.html      # 模型配置
├── mcpService.html              # MCP服务
├── dataProcessing.html          # 数据加工
├── taskList.html                # 任务列表
├── trafficStatistics.html       # 流量统计
├── systemLogs.html              # 系统日志
├── systemSettings.html          # 系统设置
├── header.html                  # 头部组件
├── footer.html                  # 底部组件
└── *.css, *.js                  # 对应的样式和脚本文件
```

## 🛠️ 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- 原生 Web Components（如适用）

## 📝 注意事项

1. 所有文件路径使用相对路径
2. 确保所有资源文件都已提交到仓库
3. GitHub Pages 部署后需要几分钟才能生效
4. 如果使用私有仓库，GitHub Pages 仍然可以访问（但需要 GitHub 账号）

## 🔗 相关链接

- [GitHub Pages 文档](https://docs.github.com/cn/pages)
- [Git 官方文档](https://git-scm.com/doc)

---

**版本**: 1.0.0  
**最后更新**: 2024年

