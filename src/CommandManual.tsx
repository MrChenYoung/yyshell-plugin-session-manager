// Command Manual Component - Shows Screen/Tmux command reference
import { useState } from 'react';
import { screenManual, tmuxManual, type ManualData, type CommandCategory, type Command } from './commandData';

interface CommandManualProps {
    onClose: () => void;
}

export function CommandManual({ onClose }: CommandManualProps) {
    const [activeTab, setActiveTab] = useState<'screen' | 'tmux'>('screen');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['会话管理']));

    const currentManual: ManualData = activeTab === 'screen' ? screenManual : tmuxManual;

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryName)) {
                next.delete(categoryName);
            } else {
                next.add(categoryName);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedCategories(new Set(currentManual.categories.map(c => c.name)));
    };

    const collapseAll = () => {
        setExpandedCategories(new Set());
    };

    return (
        <div className="sm-manual-overlay" onClick={onClose}>
            <div className="sm-manual-drawer" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sm-manual-header">
                    <div className="sm-manual-title">
                        <span className="sm-manual-icon">📖</span>
                        命令手册
                    </div>
                    <button className="sm-manual-close" onClick={onClose}>×</button>
                </div>

                {/* Tabs */}
                <div className="sm-manual-tabs">
                    <button
                        className={`sm-manual-tab ${activeTab === 'screen' ? 'active' : ''}`}
                        onClick={() => setActiveTab('screen')}
                    >
                        <span className="sm-tab-icon">🖥️</span>
                        Screen
                    </button>
                    <button
                        className={`sm-manual-tab ${activeTab === 'tmux' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tmux')}
                    >
                        <span className="sm-tab-icon">🪟</span>
                        Tmux
                    </button>
                </div>

                {/* Prefix hint */}
                {currentManual.prefix && (
                    <div className="sm-manual-prefix">
                        <span className="sm-prefix-badge">⌨️ {currentManual.prefix}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="sm-manual-actions">
                    <button className="sm-manual-action-btn" onClick={expandAll}>全部展开</button>
                    <button className="sm-manual-action-btn" onClick={collapseAll}>全部折叠</button>
                </div>

                {/* Content */}
                <div className="sm-manual-content">
                    {currentManual.categories.map((category: CommandCategory) => (
                        <div key={category.name} className="sm-manual-category">
                            <div
                                className="sm-category-header"
                                onClick={() => toggleCategory(category.name)}
                            >
                                <span className="sm-category-icon">{category.icon}</span>
                                <span className="sm-category-name">{category.name}</span>
                                <span className="sm-category-count">{category.commands.length}</span>
                                <span className={`sm-category-arrow ${expandedCategories.has(category.name) ? 'expanded' : ''}`}>
                                    ▶
                                </span>
                            </div>

                            {expandedCategories.has(category.name) && (
                                <div className="sm-category-commands">
                                    {category.commands.map((cmd: Command, idx: number) => (
                                        <div key={idx} className="sm-command-item">
                                            <div className="sm-command-main">
                                                {cmd.command && (
                                                    <code className="sm-command-code">{cmd.command}</code>
                                                )}
                                                {cmd.shortcut && (
                                                    <span className="sm-command-shortcut">
                                                        <kbd>{currentManual.title === 'Screen' ? 'Ctrl+A' : 'Ctrl+B'}</kbd>
                                                        <span className="sm-shortcut-plus">+</span>
                                                        <kbd>{cmd.shortcut}</kbd>
                                                    </span>
                                                )}
                                                <span className="sm-command-desc">{cmd.description}</span>
                                            </div>
                                            {cmd.examples && cmd.examples.length > 0 && (
                                                <div className="sm-command-examples">
                                                    {cmd.examples.map((ex, exIdx) => (
                                                        <div key={exIdx} className="sm-example-item">
                                                            <code className="sm-example-code">{ex.code}</code>
                                                            {ex.description && (
                                                                <span className="sm-example-desc">{ex.description}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="sm-manual-footer">
                    <span className="sm-footer-tip">💡 按 Esc 关闭 | 点击分类展开/折叠</span>
                </div>
            </div>
        </div>
    );
}
