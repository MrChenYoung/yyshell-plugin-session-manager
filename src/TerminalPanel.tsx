// Terminal Panel Component - Embedded xterm.js terminal for session display
import { useEffect, useRef, useState, useMemo } from 'react';
import type { Session, YYShellPluginAPI, TermDataEvent } from './types';

interface TerminalPanelProps {
    session: Session;
    baseConnectionId: string;  // Base connection ID from parent
    serverHost: string;        // Server host for creating new connection
    serverUser: string;        // SSH username for connection
    serverPassword?: string;   // SSH password for authentication
    serverAuthType?: string;   // Auth type: 'Password' or 'Key'
    serverKeyPath?: string;    // Private key path for key-based auth
    api: YYShellPluginAPI;
    onDetach: () => void;
    onClose: () => void;
}

export function TerminalPanel({ session, baseConnectionId, serverHost, serverUser, serverPassword, serverAuthType, serverKeyPath, api, onDetach, onClose }: TerminalPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<any>(null);
    const fitAddonRef = useRef<any>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const hasConnectedRef = useRef(false);  // Track if already connected
    const [isAttached, setIsAttached] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [initError, setInitError] = useState<string | null>(null);

    // Generate unique connection ID for this session
    const sessionConnectionId = useMemo(() => {
        return `${baseConnectionId}-${session.type}-${session.id}`;
    }, [baseConnectionId, session.type, session.id]);

    useEffect(() => {
        // Prevent duplicate connections
        if (!containerRef.current || hasConnectedRef.current) return;
        hasConnectedRef.current = true;

        // Get Terminal and FitAddon from window or API
        const TerminalClass = (window as any).Terminal || (api.getXterm && api.getXterm());
        const FitAddonModule = (window as any).FitAddon || (api.getXtermAddonFit && api.getXtermAddonFit());

        if (!TerminalClass) {
            setInitError('xterm.js Terminal 未找到');
            setIsConnecting(false);
            return;
        }

        // Get theme from host
        const isDark = api.getTheme() === 'dark';

        // Initialize xterm.js
        const term = new TerminalClass({
            cursorBlink: true,
            fontSize: 13,
            fontFamily: '"SF Mono", "Monaco", "Consolas", "Liberation Mono", monospace',
            scrollback: 5000,
            theme: isDark ? {
                background: '#0d1117',
                foreground: '#c9d1d9',
                cursor: '#58a6ff',
                cursorAccent: '#0d1117',
                selection: 'rgba(56, 139, 253, 0.4)',
                black: '#484f58',
                red: '#ff7b72',
                green: '#3fb950',
                yellow: '#d29922',
                blue: '#58a6ff',
                magenta: '#bc8cff',
                cyan: '#39c5cf',
                white: '#b1bac4',
            } : {
                background: '#ffffff',
                foreground: '#24292e',
                cursor: '#0366d6',
                cursorAccent: '#ffffff',
                selection: 'rgba(3, 102, 214, 0.2)',
                black: '#24292e',
                red: '#d73a49',
                green: '#22863a',
                yellow: '#b08800',
                blue: '#0366d6',
                magenta: '#6f42c1',
                cyan: '#1b7c83',
                white: '#6a737d',
            }
        });

        terminalRef.current = term;

        // Open terminal
        term.open(containerRef.current);

        // Load fit addon if available
        if (FitAddonModule) {
            try {
                const FitAddonClass = FitAddonModule.FitAddon || FitAddonModule;
                const fitAddon = new FitAddonClass();
                term.loadAddon(fitAddon);
                fitAddonRef.current = fitAddon;
                setTimeout(() => fitAddon.fit(), 10);
            } catch (e) {
                console.warn('FitAddon load failed:', e);
            }
        }

        // Subscribe to terminal data from host - filter by unique session connection ID
        const unsubscribe = api.onTermData((event: TermDataEvent) => {
            if (event.id === sessionConnectionId && terminalRef.current) {
                const data = new Uint8Array(event.data);
                terminalRef.current.write(data);
            }
        });
        unsubscribeRef.current = unsubscribe;

        // Handle terminal input -> send to PTY using session connection ID
        const onDataDisposable = term.onData((data: string) => {
            api.writePty(sessionConnectionId, data);
        });

        // Connect and attach to session
        const connectAndAttach = async () => {
            try {
                // Create independent connection for this session
                // Support both password and key-based authentication
                await api.connect({
                    id: sessionConnectionId,
                    host: serverHost,
                    port: 22,
                    user: serverUser,
                    authType: serverAuthType || 'Password',
                    password: serverPassword,
                    privateKeyPath: serverKeyPath,
                });

                // Small delay to ensure PTY is ready
                await new Promise(resolve => setTimeout(resolve, 100));

                // Attach to the screen/tmux session
                // Do NOT use exec here as it causes session termination on disconnect
                const attachCmd = session.type === 'screen'
                    ? `screen -d -r ${session.id}`
                    : `tmux attach -d -t ${session.name}`;
                await api.writePty(sessionConnectionId, attachCmd + '\n');

                // Wait for the session to attach completely
                await new Promise(resolve => setTimeout(resolve, 500));

                // Resize PTY to match terminal size - this triggers screen/tmux to redraw
                // We resize twice with a small change to force a full redraw
                if (term.rows && term.cols) {
                    // First resize to slightly different size
                    await api.resizePty(sessionConnectionId, term.rows - 1, term.cols);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    // Then resize to actual size - this forces a complete redraw
                    await api.resizePty(sessionConnectionId, term.rows, term.cols);
                }

                setIsAttached(true);
            } catch (e) {
                setInitError(`连接失败: ${e}`);
            }
            setIsConnecting(false);
        };

        connectAndAttach();

        // Handle resize with debounce to avoid multiple calls during initialization
        let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
        let isInitialized = false;

        // Delay enabling resize observer to avoid initial flicker
        setTimeout(() => {
            isInitialized = true;
        }, 500);

        const resizeObserver = new ResizeObserver(() => {
            if (!isInitialized || !fitAddonRef.current || !terminalRef.current) return;

            // Debounce resize calls
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (fitAddonRef.current && terminalRef.current) {
                    fitAddonRef.current.fit();
                    const rows = terminalRef.current.rows;
                    const cols = terminalRef.current.cols;
                    api.resizePty(sessionConnectionId, rows, cols);
                }
            }, 100);
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (resizeTimeout) clearTimeout(resizeTimeout);
            if (onDataDisposable && onDataDisposable.dispose) {
                onDataDisposable.dispose();
            }
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            // Disconnect this specific session connection
            if (api.disconnect) {
                api.disconnect(sessionConnectionId).catch(console.error);
            }
            term.dispose();
            hasConnectedRef.current = false;  // Reset for potential remount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionConnectionId]);

    const handleDetach = async () => {
        try {
            // Send detach key sequence
            const detachKey = session.type === 'screen' ? '\x01d' : '\x02d'; // Ctrl-A d or Ctrl-B d
            await api.writePty(sessionConnectionId, detachKey);
            onDetach();
        } catch (e) {
            console.error('Failed to detach:', e);
        }
    };

    // Show error if initialization failed
    if (initError && !isConnecting) {
        return (
            <div className="sm-terminal-panel">
                <div className="sm-terminal-header">
                    <div className="sm-terminal-info">
                        <span className={`sm-terminal-type ${session.type}`}>
                            {session.type === 'screen' ? 'S' : 'T'}
                        </span>
                        <span className="sm-terminal-name">{session.name}</span>
                    </div>
                    <div className="sm-terminal-actions">
                        <button className="sm-terminal-btn sm-terminal-close" onClick={onClose} title="关闭">✕</button>
                    </div>
                </div>
                <div className="sm-terminal-content">
                    <div className="sm-terminal-error">
                        <p>❌ {initError}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sm-terminal-panel">
            <div className="sm-terminal-header">
                <div className="sm-terminal-info">
                    <span className={`sm-terminal-type ${session.type}`}>
                        {session.type === 'screen' ? 'S' : 'T'}
                    </span>
                    <span className="sm-terminal-name">{session.name}</span>
                    {isConnecting && <span className="sm-connecting-indicator">⏳</span>}
                    {isAttached && !isConnecting && <span className="sm-attached-indicator">●</span>}
                </div>
                <div className="sm-terminal-actions">
                    <button
                        className="sm-terminal-btn sm-terminal-close"
                        onClick={handleDetach}
                        title="分离并关闭"
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="sm-terminal-content" ref={containerRef} />
        </div>
    );
}

export default TerminalPanel;
