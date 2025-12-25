import type { Session } from '../../lib/types'
import { SessionItem } from './SessionItem'

interface SessionListProps {
    sessions: Session[]
    onRestore: (sessionId: string) => void
    onDelete?: (sessionId: string) => void
    onRename?: (sessionId: string, newName: string) => void
}

export function SessionList({ sessions, onRestore, onDelete, onRename }: SessionListProps) {
    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No saved sessions yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Click "Stash All Tabs" to save your current tabs
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {sessions.map((session) => (
                <SessionItem
                    key={session.id}
                    session={session}
                    onRestore={() => onRestore(session.id)}
                    onDelete={onDelete ? () => onDelete(session.id) : undefined}
                    onRename={onRename ? (newName) => onRename(session.id, newName) : undefined}
                />
            ))}
        </div>
    )
}
