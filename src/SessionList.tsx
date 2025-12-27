// Session Manager - Sidebar + Terminal Split Layout
// This is a standalone plugin - all styles and logic are self-contained

import { useState, useEffect, useCallback, useRef } from 'react';
import { Session, SessionType, YYShellPluginAPI, TermDataEvent } from './types';
import { TerminalPanel } from './TerminalPanel';
import { CommandManual } from './CommandManual';
import './styles.css';

// Get plugin API from window
const getAPI = (): YYShellPluginAPI | null => {
    return (window as any).__YYSHELL_PLUGIN__ || null;
};

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

const AlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

// Context Menu Icons
const AttachIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const DetachIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const MoveUpIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
);

const MoveDownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
);

const PinTopIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 17V3M5 10l7-7 7 7" />
        <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
);

const ForceDetachIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

interface SessionListProps {
    connectionId: string;
    serverName: string;
    serverHost: string;
    serverUser: string;      // SSH username for connection
    serverAuthType?: string; // Auth type: 'Password' or 'Key'
    serverKeyPath?: string;  // Private key path for key-based auth
    serverId?: string;       // Original server ID for keychain password lookup
    onBack: () => void;
}

export function SessionList({ connectionId, serverName, serverHost, serverUser, serverAuthType, serverKeyPath, serverId, onBack }: SessionListProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionType, setNewSessionType] = useState<SessionType>('screen');
    const [newSessionCommand, setNewSessionCommand] = useState('');
    const [newSessionNote, setNewSessionNote] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [availableTools, setAvailableTools] = useState({ screen: true, tmux: true });
    const [installing, setInstalling] = useState<'screen' | 'tmux' | null>(null);
    const [uninstalling, setUninstalling] = useState<'screen' | 'tmux' | null>(null);
    const [initialCheckDone, setInitialCheckDone] = useState(false);
    const [serverTimezoneOffset, setServerTimezoneOffset] = useState<number | null>(null); // Server timezone offset in minutes

    // New: Selected and attached sessions
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [attachedSessions, setAttachedSessions] = useState<Session[]>([]);
    const [currentTerminalIndex, setCurrentTerminalIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const terminalPanelsRef = useRef<HTMLDivElement>(null);

    // Terminal display count setting (1-4)
    const [terminalDisplayCount, setTerminalDisplayCount] = useState<number>(() => {
        const saved = localStorage.getItem('sm-terminal-display-count');
        return saved ? Math.min(4, Math.max(1, parseInt(saved, 10))) : 2;
    });

    // Display mode setting ('split' | 'tabs')
    const [displayMode, setDisplayMode] = useState<'split' | 'tabs'>(() => {
        const saved = localStorage.getItem('sm-display-mode');
        return (saved === 'tabs') ? 'tabs' : 'split';
    });

    // Auto-attach setting (default: false)
    const [autoAttachEnabled, setAutoAttachEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('sm-auto-attach');
        return saved === 'true';
    });

    // Active tab index for tabs mode
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    // Custom confirm dialog
    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void | Promise<void>;
    }>({ show: false, title: '', message: '', onConfirm: () => { } });

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{
        show: boolean;
        x: number;
        y: number;
        session: Session | null;
    }>({ show: false, x: 0, y: 0, session: null });

    // Batch selection mode
    const [batchMode, setBatchMode] = useState(false);
    const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set());

    const showConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
        setConfirmDialog({ show: true, title, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => { } });
    };

    // Context menu handlers
    const handleContextMenu = (e: React.MouseEvent, session: Session) => {
        e.preventDefault();
        const menuHeight = 150; // Estimated menu height
        const windowHeight = window.innerHeight;
        let y = e.clientY;

        // If menu would overflow bottom, position it above the click point
        if (y + menuHeight > windowHeight) {
            y = Math.max(10, windowHeight - menuHeight - 10);
        }

        setContextMenu({
            show: true,
            x: e.clientX,
            y: y,
            session
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ show: false, x: 0, y: 0, session: null });
    };

    // Session metadata storage (localStorage based)
    const getSessionMetadataKey = () => `sm-session-metadata-${connectionId}`;

    const loadSessionMetadata = (): Record<string, { note?: string; command?: string }> => {
        try {
            const data = localStorage.getItem(getSessionMetadataKey());
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    };

    const saveSessionMetadataToStorage = (sessionId: string, data: { command?: string; note?: string }) => {
        const all = { ...loadSessionMetadata() };
        all[sessionId] = data;
        localStorage.setItem(getSessionMetadataKey(), JSON.stringify(all));
    };

    const [sessionMetadata, setSessionMetadata] = useState<Record<string, { note?: string; command?: string }>>(loadSessionMetadata);

    // Edit session state
    const [editDialog, setEditDialog] = useState<{
        show: boolean;
        session: Session | null;
        name: string;
        command: string;
        note: string;
    }>({ show: false, session: null, name: '', command: '', note: '' });

    const openEditDialog = (session: Session) => {
        closeContextMenu();
        const meta = sessionMetadata[session.id] || {};
        setEditDialog({
            show: true,
            session,
            name: session.name,
            command: meta.command || '',
            note: meta.note || ''
        });
    };

    const closeEditDialog = () => {
        setEditDialog({ show: false, session: null, name: '', command: '', note: '' });
    };

    // Format date/time to friendly Chinese format with timezone conversion
    const formatDateTime = (dateStr?: string): string => {
        if (!dateStr) return '';
        try {
            // Parse date from screen -ls output format: "12/23/2025 04:21:38" or similar
            let date: Date | null = null;

            // Format: MM/DD/YYYY HH:MM:SS or MM/DD/YY HH:MM:SS
            const usFormat = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (usFormat) {
                const month = parseInt(usFormat[1]) - 1;
                const day = parseInt(usFormat[2]);
                let year = parseInt(usFormat[3]);
                if (year < 100) year += 2000;
                const hour = parseInt(usFormat[4]);
                const minute = parseInt(usFormat[5]);
                const second = usFormat[6] ? parseInt(usFormat[6]) : 0;

                // Create date as if it were server local time
                date = new Date(year, month, day, hour, minute, second);

                // Apply timezone conversion if we know the server's offset
                if (serverTimezoneOffset !== null) {
                    // serverTimezoneOffset is in minutes (e.g., UTC+0 = 0, UTC-5 = -300)
                    // Local offset is also in minutes (e.g., UTC+8 = -480 because getTimezoneOffset returns the opposite)
                    const localOffset = -new Date().getTimezoneOffset(); // Convert to same sign convention
                    const offsetDiff = localOffset - serverTimezoneOffset; // Difference in minutes
                    date = new Date(date.getTime() + offsetDiff * 60 * 1000);
                }
            }

            if (!date || isNaN(date.getTime())) {
                return dateStr; // Return original if parsing failed
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

            if (dateOnly.getTime() === today.getTime()) {
                return `今天 ${timeStr}`;
            } else if (dateOnly.getTime() === yesterday.getTime()) {
                return `昨天 ${timeStr}`;
            } else {
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${month}月${day}日 ${timeStr}`;
            }
        } catch {
            return dateStr;
        }
    };

    const api = getAPI();

    // Parse screen session output
    // Supports two formats:
    // 1. With date: "64806.T  (12/23/2025 04:21:38)  (Detached)"
    // 2. Without date: "64806.T  (Detached)"
    const parseScreenOutput = (output: string): Session[] => {
        const sessions: Session[] = [];
        const lines = output.split('\n');
        for (const line of lines) {
            // Try format with date first: "12345.name (date) (status)"
            let match = line.match(/^\s*(\d+)\.([^\s]+)\s+\(([^)]+)\)\s+\(([^)]+)\)/);
            if (match) {
                sessions.push({
                    id: match[1],
                    name: match[2],
                    type: 'screen',
                    status: match[4].toLowerCase().includes('attached') ? 'attached' : 'detached',
                    created: match[3]
                });
                continue;
            }
            // Try format without date: "12345.name (status)"
            match = line.match(/^\s*(\d+)\.([^\s]+)\s+\(([^)]+)\)/);
            if (match) {
                const statusText = match[3].toLowerCase();
                sessions.push({
                    id: match[1],
                    name: match[2],
                    type: 'screen',
                    status: statusText.includes('attached') ? 'attached' : 'detached',
                    created: undefined
                });
            }
        }
        return sessions;
    };

    // Parse tmux session output
    const parseTmuxOutput = (output: string): Session[] => {
        const sessions: Session[] = [];
        const lines = output.split('\n');
        for (const line of lines) {
            const match = line.match(/^([^:]+):\s*\d+\s*windows?\s*\([^)]*\)\s*(\(attached\))?/);
            if (match) {
                sessions.push({
                    id: match[1],
                    name: match[1],
                    type: 'tmux',
                    status: match[2] ? 'attached' : 'detached'
                });
            }
        }
        return sessions;
    };

    // Load sessions with tool detection - OPTIMIZED: single SSH call
    const loadSessions = useCallback(async () => {
        if (!api) return;
        setLoading(true);
        setError(null);
        try {
            // Combine all commands into a single SSH call for performance
            // This reduces 5 round-trips to 1, dramatically improving refresh speed
            const combinedCmd = `
echo "===TZ_START===" && date +%z 2>/dev/null || echo "";
echo "===SCREEN_CHECK===" && (command -v screen >/dev/null 2>&1 && echo "OK" || echo "NO");
echo "===SCREEN_LIST===" && (screen -ls 2>/dev/null || true);
echo "===TMUX_CHECK===" && (command -v tmux >/dev/null 2>&1 && echo "OK" || echo "NO");
echo "===TMUX_LIST===" && (tmux list-sessions 2>/dev/null || true);
echo "===END==="
`;
            const output = await api.sshExec(connectionId, combinedCmd);

            // Parse the combined output
            const sections = {
                tz: '',
                screenCheck: '',
                screenList: '',
                tmuxCheck: '',
                tmuxList: ''
            };

            // Extract each section using markers
            const tzMatch = output.match(/===TZ_START===\n?([\s\S]*?)===SCREEN_CHECK===/);
            const screenCheckMatch = output.match(/===SCREEN_CHECK===\n?([\s\S]*?)===SCREEN_LIST===/);
            const screenListMatch = output.match(/===SCREEN_LIST===\n?([\s\S]*?)===TMUX_CHECK===/);
            const tmuxCheckMatch = output.match(/===TMUX_CHECK===\n?([\s\S]*?)===TMUX_LIST===/);
            const tmuxListMatch = output.match(/===TMUX_LIST===\n?([\s\S]*?)===END===/);

            if (tzMatch) sections.tz = tzMatch[1].trim();
            if (screenCheckMatch) sections.screenCheck = screenCheckMatch[1].trim();
            if (screenListMatch) sections.screenList = screenListMatch[1].trim();
            if (tmuxCheckMatch) sections.tmuxCheck = tmuxCheckMatch[1].trim();
            if (tmuxListMatch) sections.tmuxList = tmuxListMatch[1].trim();

            // Parse timezone (only set once)
            if (serverTimezoneOffset === null && sections.tz) {
                const tzParsed = sections.tz.match(/^([+-])(\d{2})(\d{2})$/);
                if (tzParsed) {
                    const sign = tzParsed[1] === '+' ? 1 : -1;
                    const hours = parseInt(tzParsed[2]);
                    const mins = parseInt(tzParsed[3]);
                    setServerTimezoneOffset(sign * (hours * 60 + mins));
                }
            }

            // Parse tool availability
            const hasScreen = sections.screenCheck === 'OK';
            const hasTmux = sections.tmuxCheck === 'OK';

            // Parse sessions
            const allSessions: Session[] = [];
            if (hasScreen) {
                allSessions.push(...parseScreenOutput(sections.screenList));
            }
            if (hasTmux) {
                allSessions.push(...parseTmuxOutput(sections.tmuxList));
            }

            // Restore saved session order
            const orderKey = `sm-session-order-${connectionId}`;
            try {
                const savedOrder = localStorage.getItem(orderKey);
                if (savedOrder) {
                    const orderList: string[] = JSON.parse(savedOrder);
                    // Sort sessions based on saved order
                    allSessions.sort((a, b) => {
                        const indexA = orderList.indexOf(a.id);
                        const indexB = orderList.indexOf(b.id);
                        // Sessions not in saved order go to the end
                        if (indexA === -1 && indexB === -1) return 0;
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                    });
                }
            } catch {
                // Ignore parse errors
            }

            setSessions(allSessions);
            setAvailableTools({ screen: hasScreen, tmux: hasTmux });
            setInitialCheckDone(true);

            // Auto-select available tool
            if (!hasScreen && hasTmux) setNewSessionType('tmux');
            if (hasScreen && !hasTmux) setNewSessionType('screen');
        } catch (e) {
            setError(String(e));
        }
        setLoading(false);
    }, [connectionId, api]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // Auto-attach first 6 sessions on initial load (if enabled)
    const hasAutoAttachedRef = useRef(false);
    useEffect(() => {
        // Only auto-attach once when initial check is done, setting is enabled, and we haven't attached yet
        if (autoAttachEnabled && initialCheckDone && !hasAutoAttachedRef.current && sessions.length > 0) {
            hasAutoAttachedRef.current = true;
            // Attach first 6 sessions (or less if fewer available)
            const sessionsToAttach = sessions.slice(0, 6);
            setAttachedSessions(sessionsToAttach);
            // If tabs mode, set active to first tab
            if (displayMode === 'tabs') {
                setActiveTabIndex(0);
            }
        }
    }, [autoAttachEnabled, initialCheckDone, sessions, displayMode]);

    // Close context menu on click outside
    useEffect(() => {
        const handler = () => closeContextMenu();
        if (contextMenu.show) {
            document.addEventListener('click', handler);
            return () => document.removeEventListener('click', handler);
        }
    }, [contextMenu.show]);

    // Install tool
    const installTool = async (tool: 'screen' | 'tmux') => {
        if (!api) return;
        setInstalling(tool);
        try {
            const detectCmd = `
                if command -v apt-get >/dev/null 2>&1; then echo "apt";
                elif command -v yum >/dev/null 2>&1; then echo "yum";
                elif command -v dnf >/dev/null 2>&1; then echo "dnf";
                elif command -v pacman >/dev/null 2>&1; then echo "pacman";
                elif command -v apk >/dev/null 2>&1; then echo "apk";
                else echo "unknown"; fi
            `;
            const pm = (await api.sshExec(connectionId, detectCmd)).trim();
            let installCmd = '';
            switch (pm) {
                case 'apt': installCmd = `sudo apt-get update && sudo apt-get install -y ${tool}`; break;
                case 'yum': installCmd = `sudo yum install -y ${tool}`; break;
                case 'dnf': installCmd = `sudo dnf install -y ${tool}`; break;
                case 'pacman': installCmd = `sudo pacman -S --noconfirm ${tool}`; break;
                case 'apk': installCmd = `sudo apk add ${tool}`; break;
                default: throw new Error('无法检测包管理器');
            }
            await api.sshExec(connectionId, installCmd);
            await loadSessions();
        } catch (e) {
            setError(`安装失败: ${e}`);
        }
        setInstalling(null);
    };

    // Uninstall tool
    const uninstallTool = async (tool: 'screen' | 'tmux') => {
        showConfirm(
            '确认卸载',
            `确定要卸载 ${tool} 吗？这将无法管理 ${tool} 会话。`,
            async () => {
                closeConfirm();
                if (!api) return;
                setUninstalling(tool);
                try {
                    const detectCmd = `
                        if command -v apt-get >/dev/null 2>&1; then echo "apt";
                        elif command -v yum >/dev/null 2>&1; then echo "yum";
                        elif command -v dnf >/dev/null 2>&1; then echo "dnf";
                        elif command -v pacman >/dev/null 2>&1; then echo "pacman";
                        elif command -v apk >/dev/null 2>&1; then echo "apk";
                        else echo "unknown"; fi
                    `;
                    const pm = (await api.sshExec(connectionId, detectCmd)).trim();
                    let cmd = '';
                    switch (pm) {
                        case 'apt': cmd = `sudo apt-get remove -y ${tool}`; break;
                        case 'yum': cmd = `sudo yum remove -y ${tool}`; break;
                        case 'dnf': cmd = `sudo dnf remove -y ${tool}`; break;
                        case 'pacman': cmd = `sudo pacman -R --noconfirm ${tool}`; break;
                        case 'apk': cmd = `sudo apk del ${tool}`; break;
                        default: throw new Error('无法检测包管理器');
                    }
                    await api.sshExec(connectionId, cmd);
                    await loadSessions();
                } catch (e) {
                    setError(`卸载失败: ${e}`);
                }
                setUninstalling(null);
            }
        );
    };

    // Create session
    const createSession = async () => {
        if (!api || !newSessionName.trim()) return;

        // Immediately close dialog and show loading for better UX
        setShowCreate(false);
        setLoading(true);

        try {
            let cmd: string;
            const sessionCmd = newSessionCommand.trim();
            const sessionNote = newSessionNote.trim();

            if (newSessionType === 'screen') {
                cmd = sessionCmd
                    ? `screen -dmS ${newSessionName} bash -c '${sessionCmd}; exec bash'`
                    : `screen -dmS ${newSessionName}`;
            } else {
                cmd = sessionCmd
                    ? `tmux new -d -s ${newSessionName} "${sessionCmd}"`
                    : `tmux new -d -s ${newSessionName}`;
            }

            await api.sshExec(connectionId, cmd);

            // Save metadata if provided
            if (sessionCmd || sessionNote) {
                await loadSessions();
                const output = newSessionType === 'screen'
                    ? await api.sshExec(connectionId, 'screen -ls 2>/dev/null || true')
                    : await api.sshExec(connectionId, 'tmux list-sessions 2>/dev/null || true');

                let newSessionId: string | null = null;
                if (newSessionType === 'screen') {
                    const lines = output.split('\n');
                    for (const line of lines) {
                        const match = line.match(/^\s*(\d+)\.([^\s]+)/);
                        if (match && match[2] === newSessionName) {
                            newSessionId = match[1];
                            break;
                        }
                    }
                } else {
                    newSessionId = newSessionName;
                }

                if (newSessionId) {
                    saveSessionMetadataToStorage(newSessionId, { command: sessionCmd, note: sessionNote });
                    setSessionMetadata(prev => ({
                        ...prev,
                        [newSessionId!]: { command: sessionCmd, note: sessionNote }
                    }));
                }
            } else {
                await loadSessions();
            }

            setNewSessionName('');
            setNewSessionCommand('');
            setNewSessionNote('');
        } catch (e) {
            setError(String(e));
            setLoading(false);
        }
    };

    // Kill session
    const killSession = async (session: Session) => {
        showConfirm(
            '删除会话',
            `确定要删除会话 "${session.name}" 吗？`,
            async () => {
                // Immediately give user feedback
                closeConfirm();
                setLoading(true);
                // Remove from attached immediately for instant feedback
                setAttachedSessions(prev => prev.filter(s => s.id !== session.id));

                if (!api) {
                    setLoading(false);
                    return;
                }

                try {
                    const cmd = session.type === 'screen'
                        ? `screen -X -S ${session.id} quit`
                        : `tmux kill-session -t ${session.name}`;
                    await api.sshExec(connectionId, cmd);
                    await loadSessions();
                } catch (e) {
                    setError(String(e));
                    setLoading(false);
                }
            }
        );
    };

    // Toggle session selection for batch mode
    const toggleBatchSelect = (sessionId: string) => {
        setSelectedForBatch(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sessionId)) {
                newSet.delete(sessionId);
            } else {
                newSet.add(sessionId);
            }
            return newSet;
        });
    };

    // Select all sessions for batch delete
    const selectAllForBatch = () => {
        if (selectedForBatch.size === sessions.length) {
            setSelectedForBatch(new Set());
        } else {
            setSelectedForBatch(new Set(sessions.map(s => s.id)));
        }
    };

    // Batch delete sessions
    const batchDeleteSessions = async () => {
        if (selectedForBatch.size === 0) return;

        const count = selectedForBatch.size;
        // Capture sessions to delete BEFORE showing confirm dialog
        const sessionsToDelete = sessions.filter(s => selectedForBatch.has(s.id));

        showConfirm(
            '批量删除会话',
            `确定要删除选中的 ${count} 个会话吗？此操作不可撤销。`,
            async () => {
                // Immediately give user feedback
                closeConfirm();
                setBatchMode(false);
                setSelectedForBatch(new Set());
                setLoading(true); // Show loading in sidebar immediately

                if (!api) {
                    setLoading(false);
                    return;
                }

                try {
                    // Delete each session
                    for (const session of sessionsToDelete) {
                        // Remove from attached immediately for instant feedback
                        setAttachedSessions(prev => prev.filter(s => s.id !== session.id));

                        const cmd = session.type === 'screen'
                            ? `screen -X -S ${session.id} quit`
                            : `tmux kill-session -t ${session.name}`;
                        await api.sshExec(connectionId, cmd);
                    }

                    // Refresh sessions list
                    await loadSessions();
                } catch (e) {
                    setError(String(e));
                    setLoading(false);
                }
            }
        );
    };

    // Exit batch mode
    const exitBatchMode = () => {
        setBatchMode(false);
        setSelectedForBatch(new Set());
    };

    // Duplicate session - creates a copy with similar name
    const duplicateSession = async (session: Session) => {
        if (!api) return;

        closeContextMenu();
        setLoading(true);

        try {
            // Generate a unique name for the duplicate
            const baseName = session.name.replace(/_copy\d*$/, ''); // Remove existing _copy suffix
            let copyNum = 1;
            let newName = `${baseName}_copy`;

            // Check for existing copies and find next available number
            const existingNames = sessions.map(s => s.name);
            while (existingNames.includes(newName)) {
                copyNum++;
                newName = `${baseName}_copy${copyNum}`;
            }

            // Get the original session's metadata
            const metadata = sessionMetadata[session.id];
            const sessionCmd = metadata?.command || '';

            // Create the duplicate session
            let cmd: string;
            if (session.type === 'screen') {
                cmd = sessionCmd
                    ? `screen -dmS ${newName} bash -c '${sessionCmd}; exec bash'`
                    : `screen -dmS ${newName}`;
            } else {
                cmd = sessionCmd
                    ? `tmux new -d -s ${newName} "${sessionCmd}"`
                    : `tmux new -d -s ${newName}`;
            }

            await api.sshExec(connectionId, cmd);

            // For tmux, we know the ID immediately
            // For screen, we need to get the ID but can show dialog first
            let newSessionId: string;

            if (session.type === 'screen') {
                // Get screen session ID quickly
                const output = await api.sshExec(connectionId, 'screen -ls 2>/dev/null || true');
                const lines = output.split('\n');
                newSessionId = newName; // default fallback
                for (const line of lines) {
                    const match = line.match(/^\s*(\d+)\.([^\s]+)/);
                    if (match && match[2] === newName) {
                        newSessionId = match[1];
                        break;
                    }
                }
            } else {
                // For tmux, the name is the ID
                newSessionId = newName;
            }

            // Create session object for edit dialog immediately
            const newSession: Session = {
                id: newSessionId,
                name: newName,
                type: session.type,
                status: 'detached',
                created: new Date().toLocaleString()
            };

            // Copy metadata if exists
            if (metadata) {
                saveSessionMetadataToStorage(newSessionId, { command: metadata.command, note: metadata.note });
                setSessionMetadata(prev => ({
                    ...prev,
                    [newSessionId]: { command: metadata.command, note: metadata.note }
                }));
            }

            // Refresh sessions list
            setLoading(false);
            loadSessions();
        } catch (e) {
            setError(String(e));
            setLoading(false);
        }
    };

    const attachSession = async (session: Session) => {
        // Check if already attached
        if (attachedSessions.some(s => s.id === session.id)) {
            return; // Already attached
        }

        try {
            // Send attach command to terminal
            // Use -d -r for screen (detach and reattach) to force take over
            // Use -d for tmux to detach other clients before attaching
            if (api) {
                const attachCmd = session.type === 'screen'
                    ? `screen -d -r ${session.id}`  // Force detach other connections
                    : `tmux attach -d -t ${session.name}`;  // Detach other clients
                await api.writePty(connectionId, attachCmd + '\n');
            }

            // Add to attached sessions
            setAttachedSessions(prev => {
                const newSessions = [...prev, session];
                // Auto switch to new tab in tabs mode
                if (displayMode === 'tabs') {
                    setActiveTabIndex(newSessions.length - 1);
                }
                return newSessions;
            });

            // Auto scroll to show the newly opened terminal (for split mode)
            if (displayMode === 'split') {
                setTimeout(() => {
                    const container = terminalPanelsRef.current;
                    if (container) {
                        container.scrollTo({
                            left: container.scrollWidth,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        } catch (e) {
            setError(`附加失败: ${e}`);
        }
    };

    // Detach session
    const detachSession = async (session: Session) => {
        closeContextMenu();
        setAttachedSessions(prev => prev.filter(s => s.id !== session.id));

        // Send detach command if still in terminal
        if (api) {
            const detachKey = session.type === 'screen' ? '\x01d' : '\x02d';
            try {
                await api.writePty(connectionId, detachKey);
            } catch { }
        }
    };

    // Force detach remote attached sessions
    const forceDetachRemote = async (session: Session) => {
        closeContextMenu();
        if (!api) return;

        try {
            // Send command to force detach all other clients
            if (session.type === 'screen') {
                // screen -d <session_id> detaches all attached clients
                await api.writePty(connectionId, `screen -d ${session.id}\n`);
            } else {
                // tmux detach-client -t <session_name> -a detaches all other clients
                await api.writePty(connectionId, `tmux detach-client -t ${session.name} -a\n`);
            }
            // Refresh session list after a short delay
            setTimeout(loadSessions, 500);
        } catch (e) {
            setError(`强制分离失败: ${e}`);
        }
    };

    // Handle session click
    const handleSessionClick = (session: Session) => {
        setSelectedSessionId(session.id);
    };

    // Handle session double-click
    const handleSessionDoubleClick = (session: Session) => {
        attachSession(session);
    };

    // Save edit
    const saveSessionEdit = async () => {
        if (!api || !editDialog.session) return;
        const session = editDialog.session;
        const newName = editDialog.name.trim();
        const newMeta = {
            command: editDialog.command.trim(),
            note: editDialog.note.trim()
        };

        // Immediately close dialog and update UI
        closeEditDialog();

        // Immediately update sessions list with new name for instant feedback
        if (newName && newName !== session.name) {
            setSessions(prev => prev.map(s =>
                s.id === session.id ? { ...s, name: newName } : s
            ));
        }

        // Immediately update metadata
        saveSessionMetadataToStorage(session.id, newMeta);
        setSessionMetadata(prev => ({ ...prev, [session.id]: newMeta }));

        try {
            // Rename if name changed
            if (newName && newName !== session.name) {
                const renameCmd = session.type === 'screen'
                    ? `screen -S ${session.id} -X sessionname ${newName}`
                    : `tmux rename-session -t ${session.name} ${newName}`;
                await api.sshExec(connectionId, renameCmd);
            }
            // No need to refresh - local state already updated
        } catch (e) {
            setError(`编辑失败: ${e}`);
            // Reload to restore correct state on error
            loadSessions();
        }
    };

    // Session ordering functions
    const getSessionOrderKey = () => `sm-session-order-${connectionId}`;

    const saveSessionOrder = (orderedSessions: Session[]) => {
        const orderMap = orderedSessions.map(s => s.id);
        localStorage.setItem(getSessionOrderKey(), JSON.stringify(orderMap));
    };

    const moveSessionUp = (session: Session) => {
        closeContextMenu();
        const index = sessions.findIndex(s => s.id === session.id);
        if (index <= 0) return; // Already at top or not found

        const newSessions = [...sessions];
        [newSessions[index - 1], newSessions[index]] = [newSessions[index], newSessions[index - 1]];
        setSessions(newSessions);
        saveSessionOrder(newSessions);
    };

    const moveSessionDown = (session: Session) => {
        closeContextMenu();
        const index = sessions.findIndex(s => s.id === session.id);
        if (index < 0 || index >= sessions.length - 1) return; // Already at bottom or not found

        const newSessions = [...sessions];
        [newSessions[index], newSessions[index + 1]] = [newSessions[index + 1], newSessions[index]];
        setSessions(newSessions);
        saveSessionOrder(newSessions);
    };

    const pinSessionToTop = (session: Session) => {
        closeContextMenu();
        const index = sessions.findIndex(s => s.id === session.id);
        if (index <= 0) return; // Already at top or not found

        const newSessions = [...sessions];
        const [pinnedSession] = newSessions.splice(index, 1);
        newSessions.unshift(pinnedSession);
        setSessions(newSessions);
        saveSessionOrder(newSessions);
    };

    // Get session index for displaying disabled state in menu
    const getSessionIndex = (session: Session) => sessions.findIndex(s => s.id === session.id);

    // Sync currentTerminalIndex and scroll capability with scroll position
    useEffect(() => {
        const container = terminalPanelsRef.current;
        if (!container) return;

        const updateScrollState = () => {
            const scrollLeft = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;

            // Check if we can scroll left/right
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);

            // Calculate current terminal index based on terminalDisplayCount
            // Gap is 16px between terminals
            const gap = 16;
            const terminalWidth = (clientWidth + gap) / terminalDisplayCount - gap / terminalDisplayCount;
            const currentIndex = Math.round(scrollLeft / (terminalWidth + gap / terminalDisplayCount));
            const clampedIndex = Math.max(0, Math.min(currentIndex, attachedSessions.length - 1));

            if (clampedIndex !== currentTerminalIndex) {
                setCurrentTerminalIndex(clampedIndex);
            }
        };

        // Initial check
        updateScrollState();

        container.addEventListener('scroll', updateScrollState);
        const resizeObserver = new ResizeObserver(updateScrollState);
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', updateScrollState);
            resizeObserver.disconnect();
        };
    }, [attachedSessions.length, currentTerminalIndex, terminalDisplayCount]);

    const screenCount = sessions.filter(s => s.type === 'screen').length;
    const tmuxCount = sessions.filter(s => s.type === 'tmux').length;

    // ============ RENDER ============

    return (
        <div className="sm-container">
            {/* Header */}
            <div className="sm-header">
                <div className="sm-header-left">
                    <button className="sm-back-btn" onClick={onBack}>
                        <BackIcon />
                    </button>
                    <div className="sm-server-info">
                        <h2>{serverName}</h2>
                        <span>{serverHost}</span>
                    </div>
                </div>
                <div className="sm-header-right">
                    <button className="sm-help-btn" onClick={() => setShowManual(true)} title="命令手册">
                        ?
                    </button>
                    <button className="sm-icon-btn" onClick={() => setShowSettings(true)} title="设置">
                        <SettingsIcon />
                    </button>
                    <button className="sm-btn sm-btn-primary" onClick={() => setShowCreate(true)}>
                        <PlusIcon />
                        <span>新建会话</span>
                    </button>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="sm-error">
                    <AlertIcon />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Main layout: Sidebar + Terminal Area */}
            <div className="sm-main-layout">
                {/* Left Sidebar */}
                <div className="sm-sidebar">
                    <div className="sm-sidebar-header">
                        <span className="sm-sidebar-title">会话列表</span>
                        <button className="sm-refresh-btn" onClick={loadSessions} disabled={loading} title="刷新">
                            <RefreshIcon />
                        </button>
                        <span className="sm-session-count">{sessions.length}</span>
                    </div>

                    {/* Batch selection toolbar */}
                    {sessions.length > 0 && (
                        <div className="sm-batch-toolbar">
                            {batchMode ? (
                                <>
                                    <button
                                        className="sm-batch-btn"
                                        onClick={selectAllForBatch}
                                        title={selectedForBatch.size === sessions.length ? "取消全选" : "全选"}
                                    >
                                        {selectedForBatch.size === sessions.length ? '☑ 取消全选' : '☐ 全选'}
                                    </button>
                                    <button
                                        className="sm-batch-btn sm-batch-delete"
                                        onClick={batchDeleteSessions}
                                        disabled={selectedForBatch.size === 0 || actionLoading === 'batch'}
                                    >
                                        🗑️ 删除 ({selectedForBatch.size})
                                    </button>
                                    <button
                                        className="sm-batch-btn sm-batch-cancel"
                                        onClick={exitBatchMode}
                                    >
                                        ✕ 取消
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="sm-batch-btn"
                                    onClick={() => setBatchMode(true)}
                                >
                                    ☐ 批量选择
                                </button>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="sm-sidebar-loading">
                            <div className="sm-loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span className="sm-loading-text">正在加载会话</span>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="sm-sidebar-empty">
                            <p>暂无会话</p>
                            <p className="sm-hint">点击右上角 + 创建新会话</p>
                        </div>
                    ) : (
                        <div className="sm-session-list">
                            {sessions.map(session => (
                                <div
                                    key={`${session.type}-${session.id}`}
                                    className={`sm-session-item ${selectedSessionId === session.id ? 'selected' : ''} ${attachedSessions.some(s => s.id === session.id) ? 'attached' : ''} ${batchMode && selectedForBatch.has(session.id) ? 'batch-selected' : ''}`}
                                    onClick={() => batchMode ? toggleBatchSelect(session.id) : handleSessionClick(session)}
                                    onDoubleClick={() => !batchMode && handleSessionDoubleClick(session)}
                                    onContextMenu={(e) => !batchMode && handleContextMenu(e, session)}
                                >
                                    {batchMode && (
                                        <div className="sm-batch-checkbox">
                                            {selectedForBatch.has(session.id) ? '☑' : '☐'}
                                        </div>
                                    )}
                                    <div className="sm-session-info">
                                        <div className="sm-session-header">
                                            <span className="sm-session-name">{session.name}</span>
                                            {attachedSessions.some(s => s.id === session.id) && (
                                                <span className="sm-attached-badge">📺</span>
                                            )}
                                        </div>
                                        <div className="sm-session-meta">
                                            <span className={`sm-status-badge ${attachedSessions.some(s => s.id === session.id) ? 'attached' : (session.status === 'attached' ? 'remote-attached' : 'detached')}`}>
                                                {attachedSessions.some(s => s.id === session.id) ? '本地已附加' : (session.status === 'attached' ? '远程已附加' : '空闲')}
                                            </span>
                                            <span className="sm-session-type">{session.type.toUpperCase()}</span>
                                            {session.id && (
                                                <span className="sm-session-pid">PID: {session.id.split('.')[0]}</span>
                                            )}
                                        </div>
                                        <div className="sm-session-details">
                                            {session.created && (
                                                <span className="sm-session-time">{formatDateTime(session.created)}</span>
                                            )}
                                            {session.tty && (
                                                <span className="sm-session-tty">{session.tty}</span>
                                            )}
                                        </div>
                                        {sessionMetadata[session.id]?.command && (
                                            <div className="sm-session-command-row" onClick={(e) => e.stopPropagation()}>
                                                <code className="sm-session-command-code">{sessionMetadata[session.id].command}</code>
                                                <button
                                                    className="sm-copy-cmd-btn"
                                                    title="复制命令"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const btn = e.currentTarget;
                                                        navigator.clipboard.writeText(sessionMetadata[session.id].command || '').then(() => {
                                                            btn.classList.add('copied');
                                                            setTimeout(() => btn.classList.remove('copied'), 1500);
                                                        });
                                                    }}
                                                >
                                                    <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                    </svg>
                                                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        {sessionMetadata[session.id]?.note && (
                                            <span className="sm-session-note">{sessionMetadata[session.id].note}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats footer */}
                    <div className="sm-sidebar-footer">
                        {availableTools.screen && <span>Screen: {screenCount}</span>}
                        {availableTools.tmux && <span>Tmux: {tmuxCount}</span>}
                    </div>
                </div>

                {/* Right Terminal Area */}
                <div className="sm-terminal-area">
                    {attachedSessions.length === 0 ? (
                        <div className="sm-terminal-empty">
                            <div className="sm-terminal-empty-icon">📺</div>
                            <h3>无附加的会话</h3>
                            <p>双击左侧列表中的会话以附加</p>
                        </div>
                    ) : displayMode === 'split' ? (
                        /* Split Mode - Multiple terminals side by side */
                        <>
                            <div
                                className="sm-terminal-panels"
                                ref={terminalPanelsRef}
                                style={{
                                    '--terminal-count': terminalDisplayCount,
                                    '--terminal-width': `calc(${100 / terminalDisplayCount}% - ${16 * (terminalDisplayCount - 1) / terminalDisplayCount}px)`
                                } as React.CSSProperties}
                            >
                                {attachedSessions.map((session, index) => (
                                    <TerminalPanel
                                        key={session.id}
                                        session={session}
                                        baseConnectionId={connectionId}
                                        serverHost={serverHost}
                                        serverUser={serverUser}
                                        serverAuthType={serverAuthType}
                                        serverKeyPath={serverKeyPath}
                                        serverId={serverId || connectionId}
                                        api={api!}
                                        onDetach={() => detachSession(session)}
                                        onClose={() => showConfirm(
                                            '关闭终端',
                                            `确定要关闭会话 "${session.name}" 吗？`,
                                            () => {
                                                setAttachedSessions(prev => prev.filter(s => s.id !== session.id));
                                                if (index <= currentTerminalIndex && currentTerminalIndex > 0) {
                                                    setCurrentTerminalIndex(prev => prev - 1);
                                                }
                                            }
                                        )}
                                    />
                                ))}
                            </div>
                            {/* Terminal Navigation - at bottom */}
                            {attachedSessions.length > terminalDisplayCount && (
                                <div className="sm-terminal-nav">
                                    <button
                                        className="sm-terminal-nav-btn"
                                        onClick={() => {
                                            const container = terminalPanelsRef.current;
                                            if (container) {
                                                // Scroll left by one terminal width
                                                const gap = 16;
                                                const terminalWidth = (container.clientWidth + gap) / terminalDisplayCount;
                                                container.scrollBy({ left: -terminalWidth, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={!canScrollLeft}
                                        title="上一个终端"
                                    >
                                        ‹
                                    </button>
                                    <span className="sm-terminal-nav-info">
                                        {currentTerminalIndex + 1} / {attachedSessions.length}
                                    </span>
                                    <button
                                        className="sm-terminal-nav-btn"
                                        onClick={() => {
                                            const container = terminalPanelsRef.current;
                                            if (container) {
                                                // Scroll right by one terminal width
                                                const gap = 16;
                                                const terminalWidth = (container.clientWidth + gap) / terminalDisplayCount;
                                                container.scrollBy({ left: terminalWidth, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={!canScrollRight}
                                        title="下一个终端"
                                    >
                                        ›
                                    </button>
                                    <button
                                        className="sm-terminal-close-all-btn"
                                        onClick={() => showConfirm(
                                            '关闭全部终端',
                                            `确定要关闭全部 ${attachedSessions.length} 个终端吗？`,
                                            () => setAttachedSessions([])
                                        )}
                                        title="关闭全部终端"
                                    >
                                        关闭全部
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Tabs Mode - Tab bar with single fullscreen terminal */
                        <div className="sm-tabs-container">
                            {/* Tab Bar */}
                            <div className="sm-tabs-bar">
                                <div className="sm-tabs-list">
                                    {attachedSessions.map((session, index) => (
                                        <div
                                            key={session.id}
                                            className={`sm-tab ${activeTabIndex === index ? 'active' : ''}`}
                                            onClick={() => setActiveTabIndex(index)}
                                        >
                                            <span className={`sm-tab-type ${session.type}`}>
                                                {session.type === 'screen' ? 'S' : 'T'}
                                            </span>
                                            <span className="sm-tab-name">{session.name}</span>
                                            <button
                                                className="sm-tab-close"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showConfirm(
                                                        '关闭标签',
                                                        `确定要关闭会话 "${session.name}" 吗？`,
                                                        () => {
                                                            setAttachedSessions(prev => prev.filter(s => s.id !== session.id));
                                                            if (index <= activeTabIndex && activeTabIndex > 0) {
                                                                setActiveTabIndex(prev => prev - 1);
                                                            }
                                                        }
                                                    );
                                                }}
                                                title="关闭"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {attachedSessions.length > 1 && (
                                    <button
                                        className="sm-tabs-close-all"
                                        onClick={() => showConfirm(
                                            '关闭全部标签',
                                            `确定要关闭全部 ${attachedSessions.length} 个标签吗？`,
                                            () => {
                                                setAttachedSessions([]);
                                                setActiveTabIndex(0);
                                            }
                                        )}
                                        title="关闭全部"
                                    >
                                        关闭全部
                                    </button>
                                )}
                            </div>
                            {/* Tab Content - All terminals rendered, inactive ones hidden */}
                            <div className="sm-tabs-content">
                                {attachedSessions.map((session, index) => (
                                    <div
                                        key={session.id}
                                        className={`sm-tab-panel ${index === activeTabIndex ? 'active' : ''}`}
                                        style={{ display: index === activeTabIndex ? 'flex' : 'none' }}
                                    >
                                        <TerminalPanel
                                            session={session}
                                            baseConnectionId={connectionId}
                                            serverHost={serverHost}
                                            serverUser={serverUser}
                                            serverAuthType={serverAuthType}
                                            serverKeyPath={serverKeyPath}
                                            serverId={serverId || connectionId}
                                            api={api!}
                                            onDetach={() => detachSession(session)}
                                            onClose={() => showConfirm(
                                                '关闭终端',
                                                `确定要关闭会话 "${session.name}" 吗？`,
                                                () => {
                                                    setAttachedSessions(prev => prev.filter(s => s.id !== session.id));
                                                    if (index <= activeTabIndex && activeTabIndex > 0) {
                                                        setActiveTabIndex(prev => prev - 1);
                                                    }
                                                }
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu.show && contextMenu.session && (() => {
                const sessionIndex = getSessionIndex(contextMenu.session);
                const isFirst = sessionIndex === 0;
                const isLast = sessionIndex === sessions.length - 1;
                const isLocallyAttached = attachedSessions.some(s => s.id === contextMenu.session?.id);
                const isRemoteAttached = contextMenu.session?.status === 'attached' && !isLocallyAttached;

                return (
                    <div className="sm-context-overlay" onClick={closeContextMenu}>
                        <div
                            className="sm-context-menu"
                            style={{ left: contextMenu.x, top: contextMenu.y }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with session info */}
                            <div className="sm-context-header">
                                <span className={`sm-context-type ${contextMenu.session.type}`}>
                                    {contextMenu.session.type === 'screen' ? 'S' : 'T'}
                                </span>
                                <span className="sm-context-name">{contextMenu.session.name}</span>
                            </div>

                            <div className="sm-context-divider" />

                            {/* Connection group */}
                            <div className="sm-context-group">
                                <button onClick={() => { attachSession(contextMenu.session!); closeContextMenu(); }}>
                                    <AttachIcon />
                                    <span>附加会话</span>
                                </button>
                                {isLocallyAttached && (
                                    <button onClick={() => detachSession(contextMenu.session!)}>
                                        <DetachIcon />
                                        <span>分离会话</span>
                                    </button>
                                )}
                                {isRemoteAttached && (
                                    <button onClick={() => forceDetachRemote(contextMenu.session!)}>
                                        <ForceDetachIcon />
                                        <span>强制分离远程</span>
                                    </button>
                                )}
                            </div>

                            <div className="sm-context-divider" />

                            {/* Edit group */}
                            <div className="sm-context-group">
                                <button onClick={() => openEditDialog(contextMenu.session!)}>
                                    <EditIcon />
                                    <span>编辑会话</span>
                                </button>
                                <button onClick={() => duplicateSession(contextMenu.session!)}>
                                    <CopyIcon />
                                    <span>复制会话</span>
                                </button>
                            </div>

                            <div className="sm-context-divider" />

                            {/* Sorting group */}
                            <div className="sm-context-group">
                                <button
                                    onClick={() => moveSessionUp(contextMenu.session!)}
                                    disabled={isFirst}
                                    className={isFirst ? 'sm-disabled' : ''}
                                >
                                    <MoveUpIcon />
                                    <span>上移</span>
                                </button>
                                <button
                                    onClick={() => moveSessionDown(contextMenu.session!)}
                                    disabled={isLast}
                                    className={isLast ? 'sm-disabled' : ''}
                                >
                                    <MoveDownIcon />
                                    <span>下移</span>
                                </button>
                                <button
                                    onClick={() => pinSessionToTop(contextMenu.session!)}
                                    disabled={isFirst}
                                    className={isFirst ? 'sm-disabled' : ''}
                                >
                                    <PinTopIcon />
                                    <span>置顶</span>
                                </button>
                            </div>

                            <div className="sm-context-divider" />

                            {/* Danger zone */}
                            <div className="sm-context-group">
                                <button className="sm-danger" onClick={() => { killSession(contextMenu.session!); closeContextMenu(); }}>
                                    <DeleteIcon />
                                    <span>删除会话</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Create Session Dialog */}
            {showCreate && (
                <div className="sm-dialog-overlay" onClick={() => setShowCreate(false)}>
                    <div className="sm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="sm-dialog-header">
                            <h3>新建会话</h3>
                            <button className="sm-dialog-close" onClick={() => setShowCreate(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="sm-dialog-content">
                            <div className="sm-form-group">
                                <label>会话名称 <span className="sm-required">*</span></label>
                                <input
                                    type="text"
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    placeholder="输入会话名称"
                                    autoFocus
                                />
                            </div>
                            <div className="sm-form-group">
                                <label>启动命令 <span className="sm-optional">可选</span></label>
                                <input
                                    type="text"
                                    value={newSessionCommand}
                                    onChange={(e) => setNewSessionCommand(e.target.value)}
                                    placeholder="例如: htop, python server.py"
                                />
                            </div>
                            <div className="sm-form-group">
                                <label>备注 <span className="sm-optional">可选</span></label>
                                <input
                                    type="text"
                                    value={newSessionNote}
                                    onChange={(e) => setNewSessionNote(e.target.value)}
                                    placeholder="例如: 生产环境监控"
                                />
                            </div>
                            <div className="sm-form-group">
                                <label>会话类型</label>
                                <div className="sm-type-selector">
                                    <button
                                        className={`sm-type-card ${newSessionType === 'screen' ? 'active' : ''} ${!availableTools.screen ? 'disabled' : ''}`}
                                        onClick={() => availableTools.screen && setNewSessionType('screen')}
                                        disabled={!availableTools.screen}
                                    >
                                        <span className="sm-type-icon screen">S</span>
                                        <span>Screen</span>
                                        {!availableTools.screen && <span className="sm-not-installed">未安装</span>}
                                    </button>
                                    <button
                                        className={`sm-type-card ${newSessionType === 'tmux' ? 'active' : ''} ${!availableTools.tmux ? 'disabled' : ''}`}
                                        onClick={() => availableTools.tmux && setNewSessionType('tmux')}
                                        disabled={!availableTools.tmux}
                                    >
                                        <span className="sm-type-icon tmux">T</span>
                                        <span>Tmux</span>
                                        {!availableTools.tmux && <span className="sm-not-installed">未安装</span>}
                                    </button>
                                </div>
                            </div>
                            <div className="sm-form-actions">
                                <button className="sm-btn" onClick={() => setShowCreate(false)}>取消</button>
                                <button
                                    className="sm-btn sm-btn-primary"
                                    onClick={createSession}
                                    disabled={!newSessionName.trim() || actionLoading === 'create' || (!availableTools.screen && !availableTools.tmux)}
                                >
                                    {actionLoading === 'create' ? '创建中...' : '创建'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Command Manual */}
            {showManual && (
                <CommandManual onClose={() => setShowManual(false)} />
            )}

            {/* Settings Dialog */}
            {showSettings && (
                <div className="sm-dialog-overlay" onClick={() => setShowSettings(false)}>
                    <div className="sm-dialog sm-dialog-settings" onClick={(e) => e.stopPropagation()}>
                        <div className="sm-dialog-header">
                            <h3>设置</h3>
                            <button className="sm-dialog-close" onClick={() => setShowSettings(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="sm-dialog-content">
                            {/* Terminal Display Count Setting */}
                            <div className="sm-settings-section">
                                <h4 className="sm-settings-title">显示设置</h4>

                                {/* Display Mode Toggle */}
                                <div className="sm-setting-item">
                                    <label className="sm-setting-label">显示模式</label>
                                    <div className="sm-setting-btn-group">
                                        <button
                                            className={`sm-setting-btn ${displayMode === 'split' ? 'active' : ''}`}
                                            onClick={() => {
                                                setDisplayMode('split');
                                                localStorage.setItem('sm-display-mode', 'split');
                                            }}
                                        >
                                            分屏
                                        </button>
                                        <button
                                            className={`sm-setting-btn ${displayMode === 'tabs' ? 'active' : ''}`}
                                            onClick={() => {
                                                setDisplayMode('tabs');
                                                localStorage.setItem('sm-display-mode', 'tabs');
                                            }}
                                        >
                                            标签
                                        </button>
                                    </div>
                                </div>

                                {/* Terminal Count - only show in split mode */}
                                {displayMode === 'split' && (
                                    <div className="sm-setting-item">
                                        <label className="sm-setting-label">终端显示个数</label>
                                        <div className="sm-setting-btn-group">
                                            {[1, 2, 3, 4].map((num) => (
                                                <button
                                                    key={num}
                                                    className={`sm-setting-btn ${terminalDisplayCount === num ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setTerminalDisplayCount(num);
                                                        localStorage.setItem('sm-terminal-display-count', num.toString());
                                                    }}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Auto-attach Toggle */}
                                <div className="sm-setting-item">
                                    <label className="sm-setting-label">自动附加会话</label>
                                    <div className="sm-setting-toggle-wrapper">
                                        <span className="sm-setting-hint">进入时自动附加前6个会话</span>
                                        <button
                                            className={`sm-toggle ${autoAttachEnabled ? 'active' : ''}`}
                                            onClick={() => {
                                                const newValue = !autoAttachEnabled;
                                                setAutoAttachEnabled(newValue);
                                                localStorage.setItem('sm-auto-attach', newValue.toString());
                                            }}
                                        >
                                            <span className="sm-toggle-slider" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tool Management */}
                            <div className="sm-settings-section">
                                <h4 className="sm-settings-title">工具管理</h4>
                                <div className="sm-tool-item">
                                    <div className="sm-tool-info">
                                        <span className="sm-tool-name">Screen</span>
                                        <span className={`sm-tool-status ${availableTools.screen ? 'installed' : ''}`}>
                                            {availableTools.screen ? '已安装' : '未安装'}
                                        </span>
                                    </div>
                                    {availableTools.screen ? (
                                        <button
                                            className="sm-btn sm-btn-danger"
                                            onClick={() => uninstallTool('screen')}
                                            disabled={uninstalling === 'screen'}
                                        >
                                            {uninstalling === 'screen' ? '卸载中...' : '卸载'}
                                        </button>
                                    ) : (
                                        <button
                                            className="sm-btn sm-btn-primary"
                                            onClick={() => installTool('screen')}
                                            disabled={installing === 'screen'}
                                        >
                                            {installing === 'screen' ? '安装中...' : '安装'}
                                        </button>
                                    )}
                                </div>
                                <div className="sm-tool-item">
                                    <div className="sm-tool-info">
                                        <span className="sm-tool-name">Tmux</span>
                                        <span className={`sm-tool-status ${availableTools.tmux ? 'installed' : ''}`}>
                                            {availableTools.tmux ? '已安装' : '未安装'}
                                        </span>
                                    </div>
                                    {availableTools.tmux ? (
                                        <button
                                            className="sm-btn sm-btn-danger"
                                            onClick={() => uninstallTool('tmux')}
                                            disabled={uninstalling === 'tmux'}
                                        >
                                            {uninstalling === 'tmux' ? '卸载中...' : '卸载'}
                                        </button>
                                    ) : (
                                        <button
                                            className="sm-btn sm-btn-primary"
                                            onClick={() => installTool('tmux')}
                                            disabled={installing === 'tmux'}
                                        >
                                            {installing === 'tmux' ? '安装中...' : '安装'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Session Dialog */}
            {editDialog.show && editDialog.session && (
                <div className="sm-dialog-overlay" onClick={closeEditDialog}>
                    <div className="sm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="sm-dialog-header">
                            <h3>编辑会话</h3>
                            <button className="sm-dialog-close" onClick={closeEditDialog}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="sm-dialog-content">
                            <div className="sm-form-group">
                                <label>会话名称</label>
                                <input
                                    type="text"
                                    value={editDialog.name}
                                    onChange={(e) => setEditDialog(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="sm-form-group">
                                <label>启动命令 <span className="sm-optional">可选</span></label>
                                <input
                                    type="text"
                                    value={editDialog.command}
                                    onChange={(e) => setEditDialog(prev => ({ ...prev, command: e.target.value }))}
                                    placeholder="例如: htop"
                                />
                            </div>
                            <div className="sm-form-group">
                                <label>备注 <span className="sm-optional">可选</span></label>
                                <input
                                    type="text"
                                    value={editDialog.note}
                                    onChange={(e) => setEditDialog(prev => ({ ...prev, note: e.target.value }))}
                                    placeholder="例如: 监控服务"
                                />
                            </div>
                            <div className="sm-form-actions">
                                <button className="sm-btn" onClick={closeEditDialog}>取消</button>
                                <button
                                    className="sm-btn sm-btn-primary"
                                    onClick={saveSessionEdit}
                                    disabled={actionLoading === editDialog.session.id}
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.show && (
                <div className="sm-dialog-overlay">
                    <div className="sm-dialog sm-dialog-confirm">
                        <div className="sm-dialog-header">
                            <h3>{confirmDialog.title}</h3>
                        </div>
                        <div className="sm-dialog-content">
                            <p>{confirmDialog.message}</p>
                            <div className="sm-form-actions">
                                <button className="sm-btn" onClick={closeConfirm}>取消</button>
                                <button className="sm-btn sm-btn-danger" onClick={() => { confirmDialog.onConfirm(); closeConfirm(); }}>确认</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SessionList;
