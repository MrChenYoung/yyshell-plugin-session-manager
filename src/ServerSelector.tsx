// Server Selector Component - Server selection UI for session manager plugin

import React, { useEffect, useState } from 'react';
import { ServerConfig } from './types';
import './styles.css';

interface ServerSelectorProps {
    onConnect: (server: ServerConfig, connectionId: string) => void;
}

export function ServerSelector({ onConnect }: ServerSelectorProps) {
    const [servers, setServers] = useState<ServerConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [connectingServerId, setConnectingServerId] = useState<string | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const api = window.__YYSHELL_PLUGIN__;

    useEffect(() => {
        if (!api) {
            setError('Plugin API not available');
            setLoading(false);
            return;
        }
        api.loadServers()
            .then(setServers)
            .catch(e => setError(String(e)))
            .finally(() => setLoading(false));
    }, []);

    const toggleGroup = (group: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
    };

    const handleConnect = async (server: ServerConfig) => {
        if (!api) return;
        setConnecting(true);
        setConnectingServerId(server.id);
        setError(null);
        try {
            await api.connect({
                id: server.id,
                host: server.host,
                port: server.port,
                user: server.username,
                authType: server.auth_type,
                password: server.password,
                privateKeyPath: server.private_key_path,
            });
            onConnect(server, server.id);
        } catch (e) {
            setError(String(e));
        }
        setConnecting(false);
        setConnectingServerId(null);
    };

    // Group servers
    const grouped = servers.reduce((acc, s) => {
        const g = s.group || '默认分组';
        if (!acc[g]) acc[g] = [];
        acc[g].push(s);
        return acc;
    }, {} as Record<string, ServerConfig[]>);

    return (
        <div className="sm-container">
            <div className="sm-server-selector">
                <h1 className="sm-server-selector-title">🖥️ 会话管理器</h1>
                <p className="sm-server-selector-tip">
                    💡 点击下方服务器卡片连接，连接后可管理 Screen 和 Tmux 会话
                </p>
                {error && (
                    <div className="sm-server-error">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}
                {loading ? (
                    <div className="sm-server-loading">加载中...</div>
                ) : servers.length === 0 ? (
                    <div className="sm-server-empty">暂无服务器，请先在主程序中添加服务器</div>
                ) : (
                    <div className="sm-server-groups">
                        {Object.entries(grouped).map(([group, list]) => (
                            <div key={group} className="sm-server-group">
                                <div
                                    className="sm-server-group-header"
                                    onClick={() => toggleGroup(group)}
                                >
                                    <span className="sm-server-group-arrow">
                                        {collapsedGroups.has(group) ? '▶' : '▼'}
                                    </span>
                                    <span className="sm-server-group-name">{group}</span>
                                    <span className="sm-server-group-count">({list.length})</span>
                                </div>
                                {!collapsedGroups.has(group) && (
                                    <div className="sm-server-grid">
                                        {list.map(server => (
                                            <div
                                                key={server.id}
                                                className={`sm-server-card ${connectingServerId === server.id ? 'connecting' : ''}`}
                                                onClick={() => !connecting && handleConnect(server)}
                                            >
                                                <h3 className="sm-server-card-name">{server.name}</h3>
                                                <p className="sm-server-card-info">
                                                    {server.username}@{server.host}:{server.port}
                                                </p>
                                                {connectingServerId === server.id && (
                                                    <p className="sm-server-card-status">连接中...</p>
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
        </div>
    );
}
