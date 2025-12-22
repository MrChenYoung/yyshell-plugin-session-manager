# YYShell Plugin: Session Manager

<p align="center">
  <img src="https://img.shields.io/badge/YYShell-Official%20Plugin-blue" alt="Official Plugin">
  <img src="https://img.shields.io/badge/version-1.0.0-green" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="License">
</p>

YYShell 官方插件 - 管理服务器上的 screen/tmux 会话

## ✨ 功能

- 📋 **列出会话** - 显示所有 screen 和 tmux 后台会话
- ➕ **创建会话** - 新建 screen 或 tmux 会话
- 🔗 **附加会话** - 一键连接到已有的后台会话
- ❌ **终止会话** - 关闭指定的后台会话

## 📦 安装

### 方式一：从插件市场安装（推荐）

1. 打开 YYShell
2. 点击侧边栏底部的插件中心图标 (🧩)
3. 在插件市场搜索 "会话管理器"
4. 点击安装

### 方式二：手动安装

1. 下载最新 [Release](https://github.com/MrChenYoung/yyshell-plugin-session-manager/releases)
2. 打开 YYShell 插件中心
3. 点击 "本地安装"
4. 选择下载的 .zip 文件

## 🚀 使用

1. 连接到服务器
2. 在底部面板切换到 "会话管理" 标签
3. 查看和管理服务器上的后台会话

## 📁 目录结构

```
session-manager/
├── manifest.json      # 插件清单
├── README.md          # 说明文档
└── src/
    ├── index.tsx      # 主入口
    ├── SessionList.tsx # 会话列表组件
    └── types.ts       # 类型定义
```

## 🔧 开发

如果你想为此插件贡献代码或进行二次开发：

```bash
# 克隆仓库
git clone https://github.com/MrChenYoung/yyshell-plugin-session-manager.git

# 进入目录
cd yyshell-plugin-session-manager

# 将 src 目录复制到 YYShell 的 plugins 目录下测试
```

## 📄 许可证

MIT License

## 🔗 相关链接

- [YYShell 主仓库](https://github.com/MrChenYoung/yyshell)
- [插件开发文档](https://github.com/MrChenYoung/yyshell/wiki/Plugin-Development)
