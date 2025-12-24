// Screen and Tmux command data for the manual
// 全面的 Screen 和 Tmux 命令参考手册

export interface CommandExample {
    code: string;
    description: string;
}

export interface Command {
    command?: string;        // Terminal command (for CLI commands)
    shortcut?: string;       // Keyboard shortcut (for in-session commands)
    description: string;     // 中文描述
    examples?: CommandExample[];
}

export interface CommandCategory {
    name: string;
    icon: string;
    commands: Command[];
}

export interface ManualData {
    title: string;
    prefix?: string;         // Shortcut prefix description
    categories: CommandCategory[];
}

// ==================== Screen 命令手册 ====================
export const screenManual: ManualData = {
    title: 'Screen',
    prefix: '快捷键前缀：Ctrl+A',
    categories: [
        {
            name: '会话管理',
            icon: '📋',
            commands: [
                {
                    command: 'screen',
                    description: '创建一个新的 Screen 会话',
                    examples: [
                        { code: 'screen', description: '创建匿名会话' },
                        { code: 'screen -S myproject', description: '创建名为 myproject 的会话' }
                    ]
                },
                {
                    command: 'screen -S <name>',
                    description: '创建一个指定名称的会话',
                    examples: [
                        { code: 'screen -S dev-server', description: '创建开发服务器会话' },
                        { code: 'screen -S monitor', description: '创建监控会话' }
                    ]
                },
                {
                    command: 'screen -ls',
                    description: '列出所有 Screen 会话',
                    examples: [
                        { code: 'screen -ls', description: '显示所有会话及其状态' }
                    ]
                },
                {
                    command: 'screen -r [name/pid]',
                    description: '恢复（重新连接）到一个会话',
                    examples: [
                        { code: 'screen -r', description: '恢复唯一的分离会话' },
                        { code: 'screen -r myproject', description: '恢复名为 myproject 的会话' },
                        { code: 'screen -r 12345', description: '通过 PID 恢复会话' }
                    ]
                },
                {
                    command: 'screen -d -r <name>',
                    description: '强制分离并恢复会话（从其他终端抢占）',
                    examples: [
                        { code: 'screen -d -r myproject', description: '强制接管被其他终端占用的会话' }
                    ]
                },
                {
                    command: 'screen -x <name>',
                    description: '多重连接 - 共享同一会话',
                    examples: [
                        { code: 'screen -x myproject', description: '与其他用户共享会话（结对编程）' }
                    ]
                },
                {
                    command: 'screen -X quit',
                    description: '从外部终止一个 Screen 会话',
                    examples: [
                        { code: 'screen -S myproject -X quit', description: '终止指定会话' }
                    ]
                },
                {
                    shortcut: 'd',
                    description: '分离当前会话（保持后台运行）',
                    examples: [
                        { code: 'Ctrl+A, d', description: '分离会话，稍后可用 screen -r 恢复' }
                    ]
                }
            ]
        },
        {
            name: '窗口管理',
            icon: '🪟',
            commands: [
                {
                    shortcut: 'c',
                    description: '创建一个新窗口',
                    examples: [
                        { code: 'Ctrl+A, c', description: '在当前会话中创建新窗口' }
                    ]
                },
                {
                    shortcut: 'n',
                    description: '切换到下一个窗口',
                },
                {
                    shortcut: 'p',
                    description: '切换到上一个窗口',
                },
                {
                    shortcut: '0-9',
                    description: '切换到指定编号的窗口',
                    examples: [
                        { code: 'Ctrl+A, 0', description: '切换到窗口 0' },
                        { code: 'Ctrl+A, 3', description: '切换到窗口 3' }
                    ]
                },
                {
                    shortcut: '"',
                    description: '显示窗口列表（可选择切换）',
                },
                {
                    shortcut: 'w',
                    description: '在状态栏显示窗口列表',
                },
                {
                    shortcut: 'A',
                    description: '重命名当前窗口',
                    examples: [
                        { code: 'Ctrl+A, A', description: '输入新名称后回车' }
                    ]
                },
                {
                    shortcut: 'k',
                    description: '关闭当前窗口（会询问确认）',
                },
                {
                    shortcut: '\\',
                    description: '关闭所有窗口并退出 Screen',
                }
            ]
        },
        {
            name: '分屏操作',
            icon: '⬛',
            commands: [
                {
                    shortcut: 'S',
                    description: '水平分屏（上下分割）',
                },
                {
                    shortcut: '|',
                    description: '垂直分屏（左右分割）',
                },
                {
                    shortcut: 'Tab',
                    description: '在分屏区域之间切换焦点',
                },
                {
                    shortcut: 'X',
                    description: '关闭当前分屏区域',
                },
                {
                    shortcut: 'Q',
                    description: '关闭除当前区域外的所有分屏',
                },
                {
                    shortcut: ':resize',
                    description: '调整分屏区域大小',
                    examples: [
                        { code: 'Ctrl+A, :resize +5', description: '增加5行高度' },
                        { code: 'Ctrl+A, :resize -5', description: '减少5行高度' }
                    ]
                }
            ]
        },
        {
            name: '复制与滚动',
            icon: '📜',
            commands: [
                {
                    shortcut: '[',
                    description: '进入复制/滚动模式',
                    examples: [
                        { code: 'Ctrl+A, [', description: '进入后可用方向键或 PgUp/PgDn 滚动' }
                    ]
                },
                {
                    shortcut: 'Esc',
                    description: '退出复制/滚动模式',
                },
                {
                    shortcut: 'Space',
                    description: '在复制模式中开始/结束选择',
                    examples: [
                        { code: '第一次按 Space 开始选择，移动光标，第二次按 Space 复制', description: '' }
                    ]
                },
                {
                    shortcut: ']',
                    description: '粘贴已复制的内容',
                },
                {
                    shortcut: '>',
                    description: '将复制缓冲区写入文件',
                },
                {
                    shortcut: '<',
                    description: '从文件读取到复制缓冲区',
                }
            ]
        },
        {
            name: '其他命令',
            icon: '⚙️',
            commands: [
                {
                    shortcut: '?',
                    description: '显示帮助信息（所有快捷键）',
                },
                {
                    shortcut: ':',
                    description: '进入命令行模式',
                    examples: [
                        { code: 'Ctrl+A, :hardcopy -h screen.txt', description: '将屏幕内容保存到文件' },
                        { code: 'Ctrl+A, :number 5', description: '将当前窗口编号改为5' }
                    ]
                },
                {
                    shortcut: 'H',
                    description: '开始/停止记录日志到文件',
                },
                {
                    shortcut: 'i',
                    description: '显示当前窗口信息',
                },
                {
                    shortcut: 't',
                    description: '显示时间和系统负载',
                },
                {
                    shortcut: 'x',
                    description: '锁定终端（需要密码解锁）',
                },
                {
                    shortcut: 'Z',
                    description: '重置终端',
                },
                {
                    command: 'screen -dmS <name> <cmd>',
                    description: '在后台创建会话并运行命令',
                    examples: [
                        { code: 'screen -dmS server python app.py', description: '后台启动 Python 服务' },
                        { code: 'screen -dmS backup ./backup.sh', description: '后台运行备份脚本' }
                    ]
                }
            ]
        }
    ]
};

// ==================== Tmux 命令手册 ====================
export const tmuxManual: ManualData = {
    title: 'Tmux',
    prefix: '快捷键前缀：Ctrl+B',
    categories: [
        {
            name: '会话管理',
            icon: '📋',
            commands: [
                {
                    command: 'tmux',
                    description: '创建一个新的 Tmux 会话',
                    examples: [
                        { code: 'tmux', description: '创建匿名会话' },
                        { code: 'tmux new', description: '同上' }
                    ]
                },
                {
                    command: 'tmux new -s <name>',
                    description: '创建一个指定名称的会话',
                    examples: [
                        { code: 'tmux new -s dev', description: '创建名为 dev 的会话' },
                        { code: 'tmux new-session -s project', description: '完整命令形式' }
                    ]
                },
                {
                    command: 'tmux ls',
                    description: '列出所有 Tmux 会话',
                    examples: [
                        { code: 'tmux ls', description: '简写形式' },
                        { code: 'tmux list-sessions', description: '完整形式' }
                    ]
                },
                {
                    command: 'tmux attach -t <name>',
                    description: '连接到指定会话',
                    examples: [
                        { code: 'tmux attach -t dev', description: '连接到 dev 会话' },
                        { code: 'tmux a -t dev', description: '简写形式' },
                        { code: 'tmux attach', description: '连接到最近的会话' }
                    ]
                },
                {
                    command: 'tmux attach -d -t <name>',
                    description: '强制分离并连接会话',
                    examples: [
                        { code: 'tmux attach -d -t dev', description: '从其他终端抢占 dev 会话' }
                    ]
                },
                {
                    command: 'tmux kill-session -t <name>',
                    description: '终止指定会话',
                    examples: [
                        { code: 'tmux kill-session -t dev', description: '终止 dev 会话' },
                        { code: 'tmux kill-server', description: '终止所有会话和 tmux 服务器' }
                    ]
                },
                {
                    command: 'tmux rename-session -t <old> <new>',
                    description: '重命名会话',
                    examples: [
                        { code: 'tmux rename -t 0 main', description: '将会话 0 重命名为 main' }
                    ]
                },
                {
                    shortcut: 'd',
                    description: '分离当前会话',
                },
                {
                    shortcut: 's',
                    description: '显示会话列表（可切换）',
                },
                {
                    shortcut: '$',
                    description: '重命名当前会话',
                },
                {
                    shortcut: '(',
                    description: '切换到上一个会话',
                },
                {
                    shortcut: ')',
                    description: '切换到下一个会话',
                }
            ]
        },
        {
            name: '窗口管理',
            icon: '🪟',
            commands: [
                {
                    shortcut: 'c',
                    description: '创建新窗口',
                },
                {
                    shortcut: 'n',
                    description: '切换到下一个窗口',
                },
                {
                    shortcut: 'p',
                    description: '切换到上一个窗口',
                },
                {
                    shortcut: 'l',
                    description: '切换到最后使用的窗口',
                },
                {
                    shortcut: '0-9',
                    description: '切换到指定编号的窗口',
                },
                {
                    shortcut: 'w',
                    description: '显示窗口列表（可选择切换）',
                },
                {
                    shortcut: ',',
                    description: '重命名当前窗口',
                },
                {
                    shortcut: '&',
                    description: '关闭当前窗口（需确认）',
                },
                {
                    shortcut: 'f',
                    description: '按名称查找窗口',
                },
                {
                    shortcut: '.',
                    description: '移动窗口到其他编号',
                },
                {
                    command: 'tmux swap-window -s <src> -t <dst>',
                    description: '交换两个窗口的位置',
                    examples: [
                        { code: 'tmux swap-window -s 0 -t 1', description: '交换窗口0和窗口1' }
                    ]
                }
            ]
        },
        {
            name: '面板操作',
            icon: '⬛',
            commands: [
                {
                    shortcut: '%',
                    description: '垂直分屏（左右分割）',
                },
                {
                    shortcut: '"',
                    description: '水平分屏（上下分割）',
                },
                {
                    shortcut: '方向键',
                    description: '在面板之间切换焦点',
                },
                {
                    shortcut: 'o',
                    description: '切换到下一个面板',
                },
                {
                    shortcut: ';',
                    description: '切换到上一个活动面板',
                },
                {
                    shortcut: 'q',
                    description: '显示面板编号（按数字快速切换）',
                },
                {
                    shortcut: 'x',
                    description: '关闭当前面板（需确认）',
                },
                {
                    shortcut: '!',
                    description: '将当前面板移动到新窗口',
                },
                {
                    shortcut: 'z',
                    description: '最大化/还原当前面板',
                },
                {
                    shortcut: '{',
                    description: '与上一个面板交换位置',
                },
                {
                    shortcut: '}',
                    description: '与下一个面板交换位置',
                },
                {
                    shortcut: 'Ctrl+方向键',
                    description: '调整面板大小',
                    examples: [
                        { code: 'Ctrl+B, Ctrl+↑', description: '向上扩展面板' },
                        { code: 'Ctrl+B, Ctrl+→', description: '向右扩展面板' }
                    ]
                },
                {
                    shortcut: 'Alt+方向键',
                    description: '快速调整面板大小（5单位）',
                },
                {
                    shortcut: 'Space',
                    description: '循环切换预设布局',
                },
                {
                    command: 'tmux select-layout <layout>',
                    description: '应用预设布局',
                    examples: [
                        { code: 'tmux select-layout even-horizontal', description: '水平均分' },
                        { code: 'tmux select-layout even-vertical', description: '垂直均分' },
                        { code: 'tmux select-layout main-horizontal', description: '主面板在上' },
                        { code: 'tmux select-layout main-vertical', description: '主面板在左' },
                        { code: 'tmux select-layout tiled', description: '平铺' }
                    ]
                }
            ]
        },
        {
            name: '复制模式',
            icon: '📜',
            commands: [
                {
                    shortcut: '[',
                    description: '进入复制模式（可滚动和选择）',
                },
                {
                    shortcut: 'q 或 Esc',
                    description: '退出复制模式',
                },
                {
                    shortcut: '方向键/PgUp/PgDn',
                    description: '在复制模式中移动/滚动',
                },
                {
                    shortcut: 'Space',
                    description: '开始选择文本',
                },
                {
                    shortcut: 'Enter',
                    description: '复制选中内容并退出',
                },
                {
                    shortcut: ']',
                    description: '粘贴最近复制的内容',
                },
                {
                    shortcut: '=',
                    description: '选择并粘贴缓冲区内容',
                },
                {
                    shortcut: '#',
                    description: '列出所有粘贴缓冲区',
                },
                {
                    command: 'tmux save-buffer <file>',
                    description: '将缓冲区保存到文件',
                    examples: [
                        { code: 'tmux save-buffer ~/output.txt', description: '保存到文件' }
                    ]
                },
                {
                    command: 'tmux set -g mouse on',
                    description: '启用鼠标支持（滚动、选择、调整大小）',
                }
            ]
        },
        {
            name: '其他命令',
            icon: '⚙️',
            commands: [
                {
                    shortcut: '?',
                    description: '显示所有快捷键帮助',
                },
                {
                    shortcut: ':',
                    description: '进入命令模式',
                    examples: [
                        { code: 'Ctrl+B, :set -g mouse on', description: '启用鼠标' },
                        { code: 'Ctrl+B, :source ~/.tmux.conf', description: '重新加载配置' }
                    ]
                },
                {
                    shortcut: 't',
                    description: '显示时钟',
                },
                {
                    shortcut: 'i',
                    description: '显示当前窗口信息',
                },
                {
                    shortcut: '~',
                    description: '显示之前的 tmux 消息',
                },
                {
                    command: 'tmux source-file ~/.tmux.conf',
                    description: '重新加载配置文件',
                },
                {
                    command: 'tmux send-keys -t <target> "<cmd>" Enter',
                    description: '向指定会话/窗口发送命令',
                    examples: [
                        { code: 'tmux send-keys -t dev "ls -la" Enter', description: '在 dev 会话执行 ls' }
                    ]
                },
                {
                    command: 'tmux capture-pane -p',
                    description: '捕获当前面板内容到标准输出',
                    examples: [
                        { code: 'tmux capture-pane -p > output.txt', description: '保存屏幕内容' }
                    ]
                },
                {
                    command: 'tmux new -d -s <name> "<cmd>"',
                    description: '后台创建会话并运行命令',
                    examples: [
                        { code: 'tmux new -d -s server "python app.py"', description: '后台启动服务' }
                    ]
                },
                {
                    command: 'tmux pipe-pane -o "cat >> log.txt"',
                    description: '将面板输出实时记录到文件',
                }
            ]
        }
    ]
};
