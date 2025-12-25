import { create } from 'zustand'
import type { Session } from '../../lib/types'
import * as storage from '../../lib/storage'

interface SessionState {
    sessions: Session[]
    isLoading: boolean
    error: string | null

    // Actions
    loadSessions: () => Promise<void>
    addSession: (session: Session) => Promise<void>
    removeSession: (id: string) => Promise<Session | null>
    updateSession: (id: string, updates: Partial<Omit<Session, 'id'>>) => Promise<void>
}

export const useSessionStore = create<SessionState>((set, get) => ({
    sessions: [],
    isLoading: false,
    error: null,

    loadSessions: async () => {
        set({ isLoading: true, error: null })
        try {
            const sessions = await storage.getSessions()
            set({ sessions, isLoading: false })
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
        }
    },

    addSession: async (session: Session) => {
        try {
            await storage.saveSession(session)
            set(state => ({ sessions: [session, ...state.sessions] }))
        } catch (error) {
            set({ error: (error as Error).message })
        }
    },

    removeSession: async (id: string) => {
        const { sessions } = get()
        const sessionToDelete = sessions.find(s => s.id === id)

        try {
            await storage.deleteSession(id)
            set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }))
            return sessionToDelete || null
        } catch (error) {
            set({ error: (error as Error).message })
            return null
        }
    },

    updateSession: async (id: string, updates: Partial<Omit<Session, 'id'>>) => {
        try {
            await storage.updateSession(id, updates)
            set(state => ({
                sessions: state.sessions.map(s =>
                    s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
                ),
            }))
        } catch (error) {
            set({ error: (error as Error).message })
        }
    },
}))
