# YYShell Plugin: Session Manager

<p align="center">
  <img src="https://img.shields.io/badge/YYShell-Official%20Plugin-blue" alt="Official Plugin">
  <img src="https://img.shields.io/badge/version-1.1.2-green" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="License">
</p>

YYShell 官方插件 - 管理服务器上的 screen/tmux 会话，支持终端内嵌和命令手册

## ✨ 功能

- 📋 **会话管理** - 列出、创建、附加、分离、终止 screen/tmux 会话
- 🖥️ **终端内嵌** - 直接在插件内显示终端，支持多窗口并排
- 📖 **命令手册** - 内置 Screen/Tmux 全面命令参考和示例
- ✏️ **会话编辑** - 自定义会话名称和备注
- 🔄 **批量操作** - 批量选择和删除会话
- ⚙️ **工具管理** - 安装/卸载 screen 和 tmux
- 🔐 **密钥认证** - 支持密码和密钥两种认证方式

## 📦 安装

### 方式一：从插件市场安装（推荐）

1. 打开 YYShell
2. 点击侧边栏底部的插件中心图标 (🧩)
3. 在插件市场搜索 "会话管理器"
4. 点击安装

### 方式二：从 GitHub 安装

1. 打开 YYShell 插件中心
2. 选择「从 GitHub 安装」
3. 输入仓库地址：`https://github.com/MrChenYoung/yyshell-plugin-session-manager`
4. 点击确认安装

### 方式三：本地安装

1. 前往 [Release 页面](https://github.com/MrChenYoung/yyshell-plugin-session-manager/releases) 下载最新版本的 `session-manager.zip`
2. 打开 YYShell 插件中心
3. 选择「本地安装」
4. 选择下载的压缩包文件

## 🚀 使用

**方式一：从插件中心打开**
1. 打开插件中心
2. 点击已安装的 "会话管理器" 插件
3. 选择服务器后进入会话管理

**方式二：从终端打开**
1. 连接到服务器并打开终端
2. 点击终端区域的会话管理器图标
3. 直接进入当前服务器的会话管理

**使用功能：**
- 双击会话可直接在右侧打开终端
- 点击 **?** 按钮可查看 Screen/Tmux 命令手册

## 📁 目录结构

```
session-manager/
├── manifest.json         # 插件清单
├── README.md             # 说明文档
└── src/
    ├── index.tsx         # 主入口 & 服务器选择
    ├── SessionList.tsx   # 会话列表组件
    ├── TerminalPanel.tsx # 终端面板组件
    ├── CommandManual.tsx # 命令手册组件
    ├── commandData.ts    # 命令数据（Screen/Tmux）
    ├── types.ts          # 类型定义
    └── styles.css        # 样式文件
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
