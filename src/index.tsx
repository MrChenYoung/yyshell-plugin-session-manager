// Session Manager Plugin - Entry Point

import React from 'react';
import { SessionList } from './SessionList';

// This component will be rendered by the host application
export interface SessionManagerProps {
    connectionId: string | null;
}

export function SessionManager({ connectionId }: SessionManagerProps) {
    return <SessionList connectionId={connectionId} />;
}

// Export as default for dynamic import
export default SessionManager;

// Plugin metadata (can be read by host)
export const pluginInfo = {
    id: 'session-manager',
    name: '会话管理器',
    version: '1.0.0',
};
