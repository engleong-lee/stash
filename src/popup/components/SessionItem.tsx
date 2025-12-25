import { useState } from 'react'
import type { Session } from '../../lib/types'
import { formatRelativeTime } from '../../lib/utils'

interface SessionItemProps {
    session: Session
    onRestore: () => void
    onDelete?: () => void
    onRename?: (newName: string) => void
    onEdit?: () => void
}

export function SessionItem({ session, onRestore, onDelete, onRename, onEdit }: SessionItemProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(session.name)
    const [showPreview, setShowPreview] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const handleEditStart = (e: React.MouseEvent) => {
        e.stopPropagation()
        setEditName(session.name)
        setIsEditing(true)
    }

    const handleEditSave = () => {
        if (editName.trim() && editName !== session.name && onRename) {
            onRename(editName.trim())
        }
        setIsEditing(false)
    }

    const handleEditCancel = () => {
        setEditName(session.name)
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditSave()
        } else if (e.key === 'Escape') {
            handleEditCancel()
        }
    }

    const handleExpandToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsExpanded(!isExpanded)
    }

    // Show 3 tabs normally, or all if expanded
    const visibleTabs = isExpanded ? session.tabs : session.tabs.slice(0, 3)
    const remainingCount = session.tabs.length - 3

    return (
        <div
            className="group relative"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => {
                setShowPreview(false)
                setIsExpanded(false)
            }}
        >
            <div
                className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                onClick={isEditing ? undefined : onRestore}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>

                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleEditSave}
                                    autoFocus
                                    className="flex-1 text-sm font-medium bg-white dark:bg-gray-700 border border-indigo-500 rounded px-2 py-0.5 focus:outline-none text-gray-900 dark:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {session.name}
                                </h3>
                            )}
                        </div>

                        {/* Tab preview - show on hover or when expanded */}
                        {(showPreview || isExpanded) && !isEditing && visibleTabs.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {visibleTabs.map((tab, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        {tab.favicon ? (
                                            <img src={tab.favicon} alt="" className="w-3 h-3 flex-shrink-0" />
                                        ) : (
                                            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />
                                        )}
                                        <span className="truncate">{tab.title}</span>
                                    </div>
                                ))}

                                {/* Expand/collapse toggle */}
                                {remainingCount > 0 && !isExpanded && (
                                    <button
                                        onClick={handleExpandToggle}
                                        className="text-xs text-indigo-500 hover:text-indigo-600 font-medium pl-5"
                                    >
                                        + {remainingCount} more tab{remainingCount !== 1 ? 's' : ''}
                                    </button>
                                )}
                                {isExpanded && session.tabs.length > 3 && (
                                    <button
                                        onClick={handleExpandToggle}
                                        className="text-xs text-gray-400 hover:text-gray-500 font-medium pl-5"
                                    >
                                        Show less
                                    </button>
                                )}
                            </div>
                        )}

                        {!showPreview && !isExpanded && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {session.tabs.length} tab{session.tabs.length !== 1 ? 's' : ''} · {formatRelativeTime(session.createdAt)}
                            </p>
                        )}
                    </div>

                    {/* Action buttons (shown on hover) */}
                    {!isEditing && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onEdit()
                                    }}
                                    className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                                    title="Edit session tabs"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </button>
                            )}
                            {onRename && (
                                <button
                                    onClick={handleEditStart}
                                    className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                                    title="Rename session"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete()
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete session"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
