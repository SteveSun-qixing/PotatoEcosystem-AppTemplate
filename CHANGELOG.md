# Changelog

## [1.0.0] - 2026-02-08

### Added
- 初始化项目结构（electron-vite + Vue 3 + TypeScript + Pinia）
- Electron 主进程（窗口管理、IPC 处理、内核进程管理、应用菜单）
- 预加载脚本（contextBridge 安全暴露 API）
- SDK 服务（ChipsSDK 初始化与管理）
- 多语言服务（零硬编码，dev_i18n.yaml 词汇表，zh-CN / en-US）
- 主题服务（CSS 变量注入，亮色/暗色切换，系统主题检测）
- 快捷键服务（标准快捷键绑定，支持自定义）
- 日志服务（结构化日志，按级别分类）
- 应用状态管理（Pinia store）
- 组合式函数（use-sdk / use-i18n / use-theme / use-keyboard）
- 应用头部组件（标题、主题切换、语言切换）
- 状态栏组件（SDK 状态、连接状态、语言、主题）
- 5 个生态链路测试面板（SDK / i18n / 主题 / 事件总线 / 内核通信）
- 单元测试（i18n 插值、快捷键管理、类型验证）
- 开发配置（ESLint / Prettier / TypeScript / Vitest）
- 项目文档（README.md / CHANGELOG.md / LICENSE）
