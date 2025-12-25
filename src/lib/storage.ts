import type { Session, Settings, StorageData } from './types'
import { STORAGE_KEYS, CURRENT_VERSION, DEFAULT_SETTINGS } from './constants'

// Get all sessions from storage
export async function getSessions(): Promise<Session[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS)
    const sessions = result[STORAGE_KEYS.SESSIONS]
    return Array.isArray(sessions) ? sessions : []
}

// Save a single session (append to existing sessions)
export async function saveSession(session: Session): Promise<void> {
    const sessions = await getSessions()
    const updatedSessions = [session, ...sessions]
    await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: updatedSessions })
}

// Delete a session by ID
export async function deleteSession(id: string): Promise<void> {
    const sessions = await getSessions()
    const filteredSessions = sessions.filter(s => s.id !== id)
    await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: filteredSessions })
}

// Update a session by ID
export async function updateSession(
    id: string,
    updates: Partial<Omit<Session, 'id'>>
): Promise<void> {
    const sessions = await getSessions()
    const updatedSessions = sessions.map(s =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
    )
    await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: updatedSessions })
}

// Get settings from storage
export async function getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
    const storedSettings = result[STORAGE_KEYS.SETTINGS] as Partial<Settings> | undefined
    return { ...DEFAULT_SETTINGS, ...(storedSettings || {}) }
}

// Save settings to storage
export async function saveSettings(settings: Partial<Settings>): Promise<void> {
    const currentSettings = await getSettings()
    const updatedSettings = { ...currentSettings, ...settings }
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updatedSettings })
}

// Get storage data with version
export async function getStorageData(): Promise<StorageData> {
    const [sessions, settings] = await Promise.all([
        getSessions(),
        getSettings(),
    ])
    return {
        version: CURRENT_VERSION,
        sessions,
        settings,
    }
}

// Generate a UUID for new sessions
export function generateId(): string {
    return crypto.randomUUID()
}
