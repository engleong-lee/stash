// Session schema
export interface Session {
    id: string                    // UUID
    name: string                  // Session name
    tabs: Tab[]                   // Array of tabs
    createdAt: number             // Unix timestamp
    updatedAt: number             // Unix timestamp
}

export interface Tab {
    url: string
    title: string
    favicon: string               // Favicon URL or data URI
}

// Storage schema
export interface StorageData {
    version: number               // Schema version for migrations
    sessions: Session[]
    settings: Settings
}

export interface Settings {
    restoreInNewWindow: boolean
    closeTabsAfterSave: boolean
    aiNamingEnabled: boolean
    aiProvider: 'ollama' | 'claude'     // AI provider choice
    ollamaModel: string                  // e.g., 'llama3.2:1b'
    claudeApiKey: string                 // User's Claude API key
    syncEnabled: boolean
}

// Message types for communication between popup and background
export type MessageType =
    | { type: 'GET_CURRENT_TABS' }
    | { type: 'SAVE_SESSION'; session: Session }
    | { type: 'RESTORE_SESSION'; sessionId: string; newWindow?: boolean }
    | { type: 'DELETE_SESSION'; sessionId: string }
    | { type: 'GET_SESSIONS' }
    | { type: 'GENERATE_SESSION_NAME'; tabTitles: string[] }

export interface MessageResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}
