// Session Manager - Session List Component

import React, { useState, useEffect, useCallback } from 'react';
import { Session, SessionListResult, SessionType } from './types';

// Icons (inline SVG for independence)
const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const LinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);

interface SessionListProps {
    connectionId: string | null;
}

export function SessionList({ connectionId }: SessionListProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionType, setNewSessionType] = useState<SessionType>('screen');
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Get plugin API
    const api = window.__YYSHELL__;

    // Parse screen -ls output
    const parseScreenOutput = (output: string): Session[] => {
        const sessions: Session[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            // Match: 12345.session_name (Detached) or (Attached)
            const match = line.match(/^\s*(\d+)\.(\S+)\s+\(([^)]+)\)/);
            if (match) {
                sessions.push({
                    id: match[1],
                    name: match[2],
                    type: 'screen',
                    status: match[3].toLowerCase().includes('attached') ? 'attached' : 'detached',
                });
            }
        }
        return sessions;
    };

    // Parse tmux list-sessions output
    const parseTmuxOutput = (output: string): Session[] => {
        const sessions: Session[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            // Match: session_name: windows (created date) or (attached)
            const match = line.match(/^([^:]+):\s*\d+\s*windows?\s*(?:\([^)]*\))?\s*(\(attached\))?/);
            if (match) {
                sessions.push({
                    id: match[1],
                    name: match[1],
                    type: 'tmux',
                    status: match[2] ? 'attached' : 'detached',
                });
            }
        }
        return sessions;
    };

    // Load sessions
    const loadSessions = useCallback(async () => {
        if (!connectionId || !api) return;

        setLoading(true);
        setError(null);

        try {
            const allSessions: Session[] = [];

            // Get screen sessions
            try {
                const screenOutput = await api.sshExec(connectionId, 'screen -ls 2>/dev/null || true');
                allSessions.push(...parseScreenOutput(screenOutput));
            } catch (e) {
                console.log('No screen sessions or screen not installed');
            }

            // Get tmux sessions
            try {
                const tmuxOutput = await api.sshExec(connectionId, 'tmux list-sessions 2>/dev/null || true');
                allSessions.push(...parseTmuxOutput(tmuxOutput));
            } catch (e) {
                console.log('No tmux sessions or tmux not installed');
            }

            setSessions(allSessions);
        } catch (e) {
            setError(String(e));
        }

        setLoading(false);
    }, [connectionId, api]);

    // Load on mount and when connection changes
    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // Create new session
    const createSession = async () => {
        if (!connectionId || !api || !newSessionName.trim()) return;

        setLoading(true);
        try {
            if (newSessionType === 'screen') {
                await api.sshExec(connectionId, `screen -dmS ${newSessionName}`);
            } else {
                await api.sshExec(connectionId, `tmux new -d -s ${newSessionName}`);
            }
            setNewSessionName('');
            setShowCreateForm(false);
            await loadSessions();
        } catch (e) {
            setError(String(e));
        }
        setLoading(false);
    };

    // Attach to session
    const attachSession = async (session: Session) => {
        if (!connectionId || !api) return;

        try {
            if (session.type === 'screen') {
                // Write screen attach command to terminal
                await api.writePty(connectionId, `screen -r ${session.id}\n`);
            } else {
                await api.writePty(connectionId, `tmux attach -t ${session.name}\n`);
            }
        } catch (e) {
            setError(String(e));
        }
    };

    // Kill session
    const killSession = async (session: Session) => {
        if (!connectionId || !api) return;

        if (!confirm(`确定要终止会话 "${session.name}" 吗？`)) return;

        setLoading(true);
        try {
            if (session.type === 'screen') {
                await api.sshExec(connectionId, `screen -X -S ${session.id} quit`);
            } else {
                await api.sshExec(connectionId, `tmux kill-session -t ${session.name}`);
            }
            await loadSessions();
        } catch (e) {
            setError(String(e));
        }
        setLoading(false);
    };

    // Styles
    const styles = {
        container: {
            padding: '12px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column' as const,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
        },
        title: {
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        button: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '12px',
        },
        buttonPrimary: {
            background: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
        },
        buttonDanger: {
            color: '#ff6b6b',
        },
        iconButton: {
            padding: '6px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
        },
        sessionList: {
            flex: 1,
            overflow: 'auto',
        },
        sessionItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
            marginBottom: '6px',
        },
        badge: {
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 500,
        },
        badgeScreen: {
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
        },
        badgeTmux: {
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
        },
        statusDot: {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
        },
        statusAttached: {
            background: '#10b981',
        },
        statusDetached: {
            background: '#6b7280',
        },
        input: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)',
            color: 'inherit',
            fontSize: '13px',
            outline: 'none',
        },
        select: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)',
            color: 'inherit',
            fontSize: '13px',
        },
        createForm: {
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
        },
        empty: {
            textAlign: 'center' as const,
            padding: '40px',
            color: 'rgba(255,255,255,0.4)',
        },
        error: {
            padding: '10px',
            borderRadius: '6px',
            background: 'rgba(255,0,0,0.1)',
            color: '#ff6b6b',
            marginBottom: '12px',
        },
    };

    if (!connectionId) {
        return (
            <div style={styles.container}>
                <div style={styles.empty}>
                    <p>请先连接到服务器</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.title}>
                    <span>🖥️ 后台会话</span>
                    <span style={{ opacity: 0.5, fontWeight: 400 }}>
                        ({sessions.length})
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        style={styles.iconButton}
                        onClick={loadSessions}
                        disabled={loading}
                        title="刷新"
                    >
                        <RefreshIcon />
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.buttonPrimary }}
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        <PlusIcon />
                        新建
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div style={styles.createForm}>
                    <input
                        style={{ ...styles.input, flex: 1 }}
                        placeholder="会话名称"
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && createSession()}
                    />
                    <select
                        style={styles.select}
                        value={newSessionType}
                        onChange={(e) => setNewSessionType(e.target.value as SessionType)}
                    >
                        <option value="screen">Screen</option>
                        <option value="tmux">Tmux</option>
                    </select>
                    <button
                        style={{ ...styles.button, ...styles.buttonPrimary }}
                        onClick={createSession}
                        disabled={loading || !newSessionName.trim()}
                    >
                        创建
                    </button>
                </div>
            )}

            {/* Session List */}
            <div style={styles.sessionList}>
                {loading && sessions.length === 0 ? (
                    <div style={styles.empty}>加载中...</div>
                ) : sessions.length === 0 ? (
                    <div style={styles.empty}>
                        <p>暂无后台会话</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>
                            点击"新建"创建 screen 或 tmux 会话
                        </p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={`${session.type}-${session.id}`} style={styles.sessionItem}>
                            {/* Status dot */}
                            <div
                                style={{
                                    ...styles.statusDot,
                                    ...(session.status === 'attached'
                                        ? styles.statusAttached
                                        : styles.statusDetached),
                                }}
                                title={session.status === 'attached' ? '已附加' : '已分离'}
                            />

                            {/* Type badge */}
                            <span
                                style={{
                                    ...styles.badge,
                                    ...(session.type === 'screen'
                                        ? styles.badgeScreen
                                        : styles.badgeTmux),
                                }}
                            >
                                {session.type}
                            </span>

                            {/* Name */}
                            <span style={{ flex: 1 }}>{session.name}</span>

                            {/* ID for screen */}
                            {session.type === 'screen' && (
                                <span style={{ opacity: 0.5, fontSize: '11px' }}>
                                    #{session.id}
                                </span>
                            )}

                            {/* Actions */}
                            <button
                                style={styles.iconButton}
                                onClick={() => attachSession(session)}
                                title="附加"
                            >
                                <LinkIcon />
                            </button>
                            <button
                                style={{ ...styles.iconButton, ...styles.buttonDanger }}
                                onClick={() => killSession(session)}
                                title="终止"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
