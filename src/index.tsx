// Session Manager Plugin - Entry Point
// Complete plugin with server selection and session management

import React, { useState, useEffect } from 'react';
import { SessionList } from './SessionList';
import { ServerSelector } from './ServerSelector';
import { ServerConfig } from './types';
import './styles.css';

export interface SessionManagerAppProps {
    // Optional: if provided, skip server selection
    initialConnectionId?: string;
    initialServer?: ServerConfig;
    // Optional: server config for auto-connect (from host app's new button)
    // Can be a ServerConfig object, JSON string, or URI-encoded JSON string
    autoConnectServer?: ServerConfig | string;
}

// Helper function to safely parse autoConnectServer parameter
// Handles both snake_case (from backend) and camelCase (from frontend) field names
function parseAutoConnectServer(input: ServerConfig | string | undefined): ServerConfig | null {
    if (!input) return null;

    // If it's already an object, normalize field names and return
    if (typeof input === 'object' && input !== null) {
        const obj = input as any;
        // Normalize: support both snake_case and camelCase field names
        return {
            id: obj.id,
            name: obj.name,
            host: obj.host,
            port: obj.port,
            username: obj.username || obj.user,
            auth_type: obj.auth_type || obj.authType || 'Password',
            password: obj.password,
            private_key_path: obj.private_key_path || obj.privateKeyPath,
            tags: obj.tags || [],
            group: obj.group,
        } as ServerConfig;
    }

    // If it's a string, try to parse it
    if (typeof input === 'string') {
        let jsonStr = input;

        // Try URI decoding first (if it looks encoded)
        if (jsonStr.includes('%')) {
            try {
                jsonStr = decodeURIComponent(jsonStr);
            } catch (e) {
                console.warn('[SessionManager] Failed to URI decode autoConnectServer, trying raw parse:', e);
                // Continue with original string
            }
        }

        // Try JSON parsing
        try {
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object' && parsed.id && parsed.host) {
                // Normalize field names
                return {
                    id: parsed.id,
                    name: parsed.name,
                    host: parsed.host,
                    port: parsed.port,
                    username: parsed.username || parsed.user,
                    auth_type: parsed.auth_type || parsed.authType || 'Password',
                    password: parsed.password,
                    private_key_path: parsed.private_key_path || parsed.privateKeyPath,
                    tags: parsed.tags || [],
                    group: parsed.group,
                } as ServerConfig;
            }
        } catch (e) {
            console.warn('[SessionManager] Failed to parse autoConnectServer as JSON:', e);
        }
    }

    console.warn('[SessionManager] Could not parse autoConnectServer, falling back to server selector');
    return null;
}

// Main plugin app - manages server selection and session views
export function SessionManagerApp({ initialConnectionId, initialServer, autoConnectServer: rawAutoConnectServer }: SessionManagerAppProps = {}) {
    // Parse the autoConnectServer parameter safely
    const autoConnectServer = parseAutoConnectServer(rawAutoConnectServer);

    const [selectedServer, setSelectedServer] = useState<ServerConfig | null>(initialServer || null);
    const [connectionId, setConnectionId] = useState<string | null>(initialConnectionId || null);
    // Auto-connect state
    const [autoConnecting, setAutoConnecting] = useState(false);
    const [autoConnectError, setAutoConnectError] = useState<string | null>(null);

    const api = window.__YYSHELL_PLUGIN__;

    // Handle auto-connect when autoConnectServer is provided
    useEffect(() => {
        if (!autoConnectServer || !api) return;
        // Already connected or connecting
        if (selectedServer || connectionId || autoConnecting) return;

        const doAutoConnect = async () => {
            setAutoConnecting(true);
            setAutoConnectError(null);
            try {
                await api.connect({
                    id: autoConnectServer.id,
                    host: autoConnectServer.host,
                    port: autoConnectServer.port,
                    user: autoConnectServer.username,
                    authType: autoConnectServer.auth_type,
                    password: autoConnectServer.password,
                    privateKeyPath: autoConnectServer.private_key_path,
                });
                // Connection successful
                setSelectedServer(autoConnectServer);
                setConnectionId(autoConnectServer.id);
            } catch (e) {
                setAutoConnectError(String(e));
            } finally {
                setAutoConnecting(false);
            }
        };

        doAutoConnect();
    }, [autoConnectServer, api]);

    const handleConnect = (server: ServerConfig, connId: string) => {
        setSelectedServer(server);
        setConnectionId(connId);
    };

    const handleBack = async () => {
        if (connectionId && api?.disconnect) {
            try {
                await api.disconnect(connectionId);
            } catch { }
        }
        setSelectedServer(null);
        setConnectionId(null);
        // Reset auto-connect state to allow manual selection
        setAutoConnectError(null);
    };

    // Retry auto-connect
    const handleRetryAutoConnect = async () => {
        if (!autoConnectServer || !api) return;
        setAutoConnecting(true);
        setAutoConnectError(null);
        try {
            await api.connect({
                id: autoConnectServer.id,
                host: autoConnectServer.host,
                port: autoConnectServer.port,
                user: autoConnectServer.username,
                authType: autoConnectServer.auth_type,
                password: autoConnectServer.password,
                privateKeyPath: autoConnectServer.private_key_path,
            });
            setSelectedServer(autoConnectServer);
            setConnectionId(autoConnectServer.id);
        } catch (e) {
            setAutoConnectError(String(e));
        } finally {
            setAutoConnecting(false);
        }
    };

    // Switch to manual server selection
    const handleSwitchToManual = () => {
        setAutoConnectError(null);
        // Clear autoConnectServer effect by setting a flag
        setSelectedServer(null);
        setConnectionId(null);
    };

    // If connected, render the session list
    if (selectedServer && connectionId) {
        return (
            <SessionList
                connectionId={connectionId}
                serverName={selectedServer.name}
                serverHost={selectedServer.host}
                serverUser={selectedServer.username}
                serverPassword={selectedServer.password}
                serverAuthType={selectedServer.auth_type}
                serverKeyPath={selectedServer.private_key_path}
                onBack={handleBack}
            />
        );
    }

    // Show auto-connect loading state
    if (autoConnecting) {
        return (
            <div className="sm-container">
                <div className="sm-auto-connect-loading">
                    <div className="sm-auto-connect-spinner"></div>
                    <h2>正在连接服务器...</h2>
                    <p className="sm-auto-connect-server-info">
                        {autoConnectServer?.name} ({autoConnectServer?.username}@{autoConnectServer?.host})
                    </p>
                </div>
            </div>
        );
    }

    // Show auto-connect error state
    if (autoConnectError && autoConnectServer) {
        return (
            <div className="sm-container">
                <div className="sm-auto-connect-error">
                    <div className="sm-auto-connect-error-icon">❌</div>
                    <h2>连接失败</h2>
                    <p className="sm-auto-connect-server-info">
                        {autoConnectServer.name} ({autoConnectServer.username}@{autoConnectServer.host})
                    </p>
                    <p className="sm-auto-connect-error-msg">{autoConnectError}</p>
                    <div className="sm-auto-connect-actions">
                        <button className="sm-btn sm-btn-primary" onClick={handleRetryAutoConnect}>
                            重试连接
                        </button>
                        <button className="sm-btn sm-btn-secondary" onClick={handleSwitchToManual}>
                            手动选择服务器
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, show server selector
    return <ServerSelector onConnect={handleConnect} />;
}

// Legacy export for backwards compatibility
export interface SessionManagerProps {
    connectionId: string;
    serverName: string;
    serverHost: string;
    serverUser: string;
    serverPassword?: string;
    serverAuthType?: string;
    serverKeyPath?: string;
    onBack: () => void;
}

export function SessionManager({ connectionId, serverName, serverHost, serverUser, serverPassword, serverAuthType, serverKeyPath, onBack }: SessionManagerProps) {
    return (
        <SessionList
            connectionId={connectionId}
            serverName={serverName}
            serverHost={serverHost}
            serverUser={serverUser}
            serverPassword={serverPassword}
            serverAuthType={serverAuthType}
            serverKeyPath={serverKeyPath}
            onBack={onBack}
        />
    );
}

// Export as default for dynamic import
export default SessionManagerApp;

// Plugin metadata
export const pluginInfo = {
    id: 'session-manager',
    name: '会话管理器',
    version: '1.0.0',
};
