// Plugin type definitions

export type SessionType = 'screen' | 'tmux';

export type SessionStatus = 'attached' | 'detached';

export interface Session {
    id: string;
    name: string;
    type: SessionType;
    status: SessionStatus;
    created?: string;
    tty?: string;
}

export interface SessionListResult {
    sessions: Session[];
    error?: string;
}

// YYShell Plugin API types
export interface YYShellPluginAPI {
    // Execute SSH command and get output
    sshExec(connectionId: string, command: string): Promise<string>;
    // Get current active connection ID
    getActiveConnectionId(): string | null;
    // Get active tab ID
    getActiveTabId(): string | null;
    // Write to terminal
    writePty(connectionId: string, data: string): Promise<void>;
}

// Declare global API
declare global {
    interface Window {
        __YYSHELL__?: YYShellPluginAPI;
    }
}
