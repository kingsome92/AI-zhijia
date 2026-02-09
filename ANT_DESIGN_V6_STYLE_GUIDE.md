# Ant Design V6 纯 HTML/CSS/JS 实现风格规范

## 📋 使用说明

**重要提示**：本规范用于指导使用纯 HTML/CSS/JavaScript（不使用任何框架或构建工具）实现 Ant Design V6 风格的界面。所有样式和交互效果都需要通过原生代码实现，确保可以直接在浏览器中打开 HTML 文件即可预览。

当需要按照 Ant Design V6 风格编写代码时，请严格遵循本规范。

---

## 🎨 设计 Token（Design Tokens）

### 颜色系统

:root {
  /* 主色系 */
  --ant-primary-color: #1677ff;
  --ant-primary-color-hover: #4096ff;
  --ant-primary-color-active: #0958d9;
  --ant-primary-color-outline: rgba(22, 119, 255, 0.1);
  
  /* 功能色 */
  --ant-success-color: #52c41a;
  --ant-warning-color: #faad14;
  --ant-error-color: #ff4d4f;
  --ant-info-color: #1677ff;
  
  /* 中性色 */
  --ant-text-color: rgba(0, 0, 0, 0.88);
  --ant-text-color-secondary: rgba(0, 0, 0, 0.65);
  --ant-text-color-disabled: rgba(0, 0, 0, 0.25);
  --ant-text-color-inverse: #fff;
  
  /* 边框色 */
  --ant-border-color: #d9d9d9;
  --ant-border-color-split: rgba(5, 5, 5, 0.06);
  --ant-border-color-inverse: #fff;
  
  /* 背景色 */
  --ant-bg-color: #ffffff;
  --ant-bg-color-container: #ffffff;
  --ant-bg-color-container-hover: rgba(0, 0, 0, 0.02);
  --ant-bg-color-container-active: rgba(0, 0, 0, 0.04);
  --ant-bg-color-layout: #f5f5f5;
  --ant-bg-color-elevated: #ffffff;
  
  /* 填充色 */
  --ant-fill-color: rgba(0, 0, 0, 0.06);
  --ant-fill-color-secondary: rgba(0, 0, 0, 0.04);
  --ant-fill-color-tertiary: rgba(0, 0, 0, 0.02);
}
