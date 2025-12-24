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
    // Custom metadata (stored locally)
    note?: string;
    command?: string;
}

export interface SessionListResult {
    sessions: Session[];
    error?: string;
}

// Server configuration (moved from host container)
export interface ServerConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    auth_type: 'Password' | 'Key' | 'Agent';
    password?: string;
    private_key_path?: string;
    tags: string[];
    group?: string;
}

// YYShell Plugin API types
export interface TermDataEvent {
    id: string;  // connection ID
    data: ArrayBuffer;
}

// Connection options for creating independent sessions
export interface ConnectionOptions {
    id: string;           // Unique connection ID
    host: string;
    port?: number;
    user?: string;
    password?: string;    // SSH password for authentication
}

export interface YYShellPluginAPI {
    // Load server list
    loadServers(): Promise<ServerConfig[]>;
    // Connect to server
    connect(options: {
        id: string;
        host: string;
        port: number;
        user: string;
        authType?: string;
        password?: string;
        privateKeyPath?: string;
    }): Promise<string>;
    // Disconnect from server
    disconnect(id: string): Promise<void>;
    // Execute SSH command and get output
    sshExec(connectionId: string, command: string): Promise<string>;
    // Get current active connection ID
    getActiveConnectionId(): string | null;
    // Get active tab ID
    getActiveTabId(): string | null;
    // Write to terminal
    writePty(connectionId: string, data: string): Promise<void>;
    // Resize PTY
    resizePty(connectionId: string, rows: number, cols: number): Promise<void>;
    // Attach to screen/tmux session
    attachSession(connectionId: string, type: 'screen' | 'tmux', name: string): Promise<void>;
    // Subscribe to terminal data events
    onTermData(callback: (event: TermDataEvent) => void): () => void;
    // Get current theme
    getTheme(): 'light' | 'dark';
    // Get xterm Terminal class (optional, may be provided by host)
    getXterm?(): any;
    // Get xterm FitAddon class (optional, may be provided by host)
    getXtermAddonFit?(): any;
}

// Declare global API and xterm
declare global {
    interface Window {
        __YYSHELL_PLUGIN__?: YYShellPluginAPI;
        Terminal?: any;
        FitAddon?: any;
    }
}
