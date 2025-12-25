import type { Settings } from './types'

// Storage keys
export const STORAGE_KEYS = {
    SESSIONS: 'stash_sessions',
    SETTINGS: 'stash_settings',
    VERSION: 'stash_version',
} as const

// Current storage schema version
export const CURRENT_VERSION = 1

// Default settings
export const DEFAULT_SETTINGS: Settings = {
    restoreInNewWindow: true,
    closeTabsAfterSave: false,
    aiNamingEnabled: true,
    aiProvider: 'ollama',
    ollamaModel: 'llama3.2:3b',
    claudeApiKey: '',
    syncEnabled: false,
}

// Ollama configuration
export const OLLAMA_CONFIG = {
    BASE_URL: 'http://localhost:11434',
    TIMEOUT_MS: 15000,  // 15 seconds to handle cold start
} as const

// UI Constants
export const UI = {
    POPUP_WIDTH: 360,
    POPUP_MAX_HEIGHT: 480,
    TOAST_DURATION_MS: 2000,
    SEARCH_DEBOUNCE_MS: 100,
    UNDO_TIMEOUT_MS: 5000,
} as const
