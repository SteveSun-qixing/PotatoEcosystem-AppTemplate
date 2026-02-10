# Chips AppTemplate

薯片生态标准模板应用 - Chips Ecosystem Standard App Template

## 概述

Chips-AppTemplate 是薯片生态的**标准示范应用**，严格遵循所有生态设计原稿和规范文档。它不实现具体业务功能，但完整跑通底层四件套（Chips-core、Chips-Foundation、Chips-SDK、Chips-ComponentLibrary）的所有链路，作为生态内新应用开发的参考模板。

## 功能特性

- 完整的 Electron 应用架构（主进程 + 预加载 + 渲染进程）
- 集成薯片 SDK（ChipsSDK 初始化、CoreConnector 通信）
- 多语言系统（零硬编码，dev_i18n.yaml 词汇表，zh-CN / en-US）
- 主题系统（CSS 变量注入，亮色/暗色切换，系统主题检测）
- 快捷键系统（标准快捷键绑定，支持自定义）
- 日志系统（结构化日志，按级别分类）
- 配置系统（YAML 配置文件，层级覆盖）
- 错误处理（标准化错误代码）
- 5 个生态链路测试面板（SDK / i18n / 主题 / 事件总线 / 内核通信）

## 遵循的规范

| 规范 | 来源 |
|------|------|
| 中心路由架构 | 设计原稿 15 |
| 微内核四层架构 | 设计原稿 13 |
| 前后端完全分离 | 设计原稿 10 |
| 多语言系统 | 生态共用 11 |
| 开发规范总则 | 生态共用 08 |
| 模块联动协作 | 生态共用 14 |
| 仓库管理手册 | 生态共用 |
| 依赖管理指南 | 生态共用 12 |
| 主题系统 | 设计原稿 12、33 |

## 技术栈

- **构建工具**: electron-vite
- **前端框架**: Vue 3 + TypeScript + Composition API
- **状态管理**: Pinia
- **打包工具**: electron-builder
- **测试框架**: Vitest
- **代码规范**: ESLint + Prettier

## 安装

```bash
# 在主仓库根目录
pnpm install

# 或在模板应用目录
cd Chips-AppTemplate
pnpm install
```

## 开发

```bash
# 启动开发服务
pnpm run dev

# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint

# 格式化
pnpm run format
```

## 测试

```bash
# 运行测试
pnpm run test

# 运行测试（一次性）
pnpm run test:run

# 测试覆盖率
pnpm run test:coverage
```

## 构建

```bash
# 构建应用
pnpm run build
```

## 目录结构

```
Chips-AppTemplate/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 入口
│   │   ├── window-manager.ts    # 窗口管理
│   │   ├── ipc-handlers.ts      # IPC 处理器
│   │   ├── core-process.ts      # 内核进程管理
│   │   ├── menu.ts              # 应用菜单
│   │   └── preload/index.ts     # 预加载脚本
│   │
│   └── renderer/                # 渲染进程（Vue）
│       ├── services/            # 服务层
│       ├── stores/              # Pinia 状态管理
│       ├── composables/         # 组合式函数
│       ├── components/          # UI 组件
│       ├── i18n/                # 翻译文件
│       ├── config/              # 配置文件
│       └── types/               # 类型定义
│
├── tests/                       # 测试
├── electron.vite.config.ts      # 构建配置
└── package.json
```

## 许可证

MIT
