import { useEffect, useState, useCallback } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { useCurrentTabs } from '../hooks/useCurrentTabs'
import { useSearch } from '../hooks/useSearch'
import { SearchBar } from './SearchBar'
import { StashButton } from './StashButton'
import { SaveDialog } from './SaveDialog'
import { SessionList } from './SessionList'
import { TabSelector } from './TabSelector'
import { Settings } from './Settings'
import { Toast } from './Toast'
import { ConfirmDialog } from './ConfirmDialog'
import { SessionEditor } from './SessionEditor'
import type { Session, Tab } from '../../lib/types'
import { getSettings } from '../../lib/storage'

type View = 'main' | 'save' | 'select' | 'settings'

interface ToastState {
    message: string
    type: 'success' | 'error'
    action?: {
        label: string
        onClick: () => void
    }
}

function App() {
    const [view, setView] = useState<View>('main')
    const [toast, setToast] = useState<ToastState | null>(null)
    const [selectedTabs, setSelectedTabs] = useState<Tab[]>([])
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
    const [_deletedSession, setDeletedSession] = useState<Session | null>(null)
    const [editingSession, setEditingSession] = useState<Session | null>(null)

    const { tabs, tabCount, isLoading: tabsLoading } = useCurrentTabs()
    const { sessions, isLoading: sessionsLoading, loadSessions, addSession, removeSession, updateSession } = useSessionStore()
    const { query, setQuery, filteredSessions, isSearching, hasResults } = useSearch(sessions)

    // Load sessions on mount
    useEffect(() => {
        loadSessions()
    }, [loadSessions])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Focus search on '/' or Cmd+F
            if (e.key === '/' || (e.metaKey && e.key === 'f')) {
                e.preventDefault()
                const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
                searchInput?.focus()
            }
            // Escape to go back to main view
            if (e.key === 'Escape') {
                if (view !== 'main') {
                    setView('main')
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [view])

    const handleStashClick = () => {
        setSelectedTabs(tabs)
        setView('save')
    }

    const handleSelectTabsClick = () => {
        setView('select')
    }

    const handleTabsSelected = (selected: Tab[]) => {
        setSelectedTabs(selected)
        setView('save')
    }

    const handleSave = async (session: Session, closeTabs: boolean) => {
        try {
            await addSession(session)
            setView('main')
            setToast({ message: `Stashed ${session.tabs.length} tabs`, type: 'success' })

            if (closeTabs) {
                // Note: Close tabs functionality would need chrome.tabs.remove
                // For now, we just acknowledge the intent
            }
        } catch {
            setToast({ message: 'Failed to save session', type: 'error' })
        }
    }

    const handleRestore = useCallback(async (sessionId: string) => {
        try {
            const settings = await getSettings()
            const response = await chrome.runtime.sendMessage({
                type: 'RESTORE_SESSION',
                sessionId,
                newWindow: settings.restoreInNewWindow,
            })

            if (response.success) {
                setToast({ message: `Restored ${response.data.tabCount} tabs`, type: 'success' })
            } else {
                setToast({ message: response.error || 'Failed to restore session', type: 'error' })
            }
        } catch {
            setToast({ message: 'Failed to restore session', type: 'error' })
        }
    }, [])

    const handleDeleteClick = (sessionId: string) => {
        setConfirmDelete(sessionId)
    }

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return

        try {
            const deleted = await removeSession(confirmDelete)
            setConfirmDelete(null)

            if (deleted) {
                setDeletedSession(deleted)
                setToast({
                    message: 'Session deleted',
                    type: 'success',
                    action: {
                        label: 'Undo',
                        onClick: () => handleUndoDelete(deleted),
                    },
                })
            }
        } catch {
            setToast({ message: 'Failed to delete session', type: 'error' })
        }
    }

    const handleUndoDelete = async (session: Session) => {
        try {
            await addSession(session)
            setDeletedSession(null)
            setToast({ message: 'Session restored', type: 'success' })
        } catch {
            setToast({ message: 'Failed to restore session', type: 'error' })
        }
    }

    const handleRename = async (sessionId: string, newName: string) => {
        try {
            await updateSession(sessionId, { name: newName })
        } catch {
            setToast({ message: 'Failed to rename session', type: 'error' })
        }
    }

    const handleEditSession = (session: Session) => {
        setEditingSession(session)
    }

    const handleSaveEditedSession = async (updatedSession: Session) => {
        try {
            await chrome.runtime.sendMessage({
                type: 'UPDATE_SESSION',
                session: updatedSession,
            })
            await loadSessions() // Refresh the session list
            setEditingSession(null)
            setToast({ message: 'Session updated', type: 'success' })
        } catch {
            setToast({ message: 'Failed to update session', type: 'error' })
        }
    }

    const isLoading = tabsLoading || sessionsLoading

    // Render settings view
    if (view === 'settings') {
        return (
            <div className="w-[360px] min-h-[200px] max-h-[480px] bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
                <main className="flex-1 overflow-y-auto p-4">
                    <Settings onBack={() => setView('main')} />
                </main>
            </div>
        )
    }

    return (
        <div className="w-[360px] min-h-[200px] max-h-[480px] bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Stash</h1>
                <button
                    onClick={() => setView('settings')}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Settings"
                >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4">
                {/* Tab Selection Mode */}
                {view === 'select' ? (
                    <TabSelector
                        tabs={tabs}
                        onCancel={() => setView('main')}
                        onSelect={handleTabsSelected}
                    />
                ) : (
                    <>
                        {/* Search Bar */}
                        <div className="mb-4">
                            <SearchBar value={query} onChange={setQuery} />
                        </div>

                        {/* Save Dialog or Stash Button */}
                        {view === 'save' ? (
                            <SaveDialog
                                tabs={selectedTabs}
                                onSave={handleSave}
                                onCancel={() => setView('main')}
                            />
                        ) : (
                            <div className="mb-4 space-y-2">
                                <StashButton
                                    tabCount={tabCount}
                                    onClick={handleStashClick}
                                    disabled={isLoading || tabCount === 0}
                                />
                                <button
                                    onClick={handleSelectTabsClick}
                                    disabled={isLoading || tabCount === 0}
                                    className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Or select specific tabs →
                                </button>
                            </div>
                        )}

                        {/* Sessions Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                {isSearching ? `Search Results (${filteredSessions.length})` : 'Saved Sessions'}
                            </h2>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                            ) : isSearching && !hasResults ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No sessions match "{query}"
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Try a different search term
                                    </p>
                                </div>
                            ) : (
                                <SessionList
                                    sessions={filteredSessions}
                                    onRestore={handleRestore}
                                    onDelete={handleDeleteClick}
                                    onRename={handleRename}
                                    onEdit={handleEditSession}
                                />
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={toast.action ? 5000 : 2000}
                    onClose={() => setToast(null)}
                    action={toast.action}
                />
            )}

            {/* Confirm Delete Dialog */}
            {confirmDelete && (
                <ConfirmDialog
                    title="Delete Session"
                    message="Are you sure you want to delete this session? You can undo this action for 5 seconds."
                    confirmText="Delete"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setConfirmDelete(null)}
                    isDestructive
                />
            )}

            {/* Session Editor Modal */}
            {editingSession && (
                <SessionEditor
                    session={editingSession}
                    onSave={handleSaveEditedSession}
                    onCancel={() => setEditingSession(null)}
                />
            )}
        </div>
    )
}

export default App
