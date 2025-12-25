import { useState } from 'react'
import type { Session, Tab } from '../../lib/types'

interface SessionEditorProps {
    session: Session
    onSave: (updatedSession: Session) => void
    onCancel: () => void
}

type EditorMode = 'edit' | 'selectTabs'

export function SessionEditor({ session, onSave, onCancel }: SessionEditorProps) {
    const [tabs, setTabs] = useState<Tab[]>(session.tabs)
    const [mode, setMode] = useState<EditorMode>('edit')
    const [availableTabs, setAvailableTabs] = useState<Tab[]>([])
    const [selectedTabUrls, setSelectedTabUrls] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)

    const handleRemoveTab = (index: number) => {
        setTabs(tabs.filter((_, i) => i !== index))
    }

    const handleShowTabSelector = async () => {
        setIsLoading(true)
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TABS' })
            if (response.success && response.data) {
                const currentTabs = response.data as Tab[]
                // Filter out tabs already in session
                const existingUrls = new Set(tabs.map(t => t.url))
                const newTabs = currentTabs.filter(t => !existingUrls.has(t.url))
                setAvailableTabs(newTabs)
                setSelectedTabUrls(new Set())
                setMode('selectTabs')
            }
        } catch (error) {
            console.error('Failed to get current tabs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleTab = (url: string) => {
        const newSelected = new Set(selectedTabUrls)
        if (newSelected.has(url)) {
            newSelected.delete(url)
        } else {
            newSelected.add(url)
        }
        setSelectedTabUrls(newSelected)
    }

    const handleSelectAll = () => {
        setSelectedTabUrls(new Set(availableTabs.map(t => t.url)))
    }

    const handleSelectNone = () => {
        setSelectedTabUrls(new Set())
    }

    const handleAddSelectedTabs = () => {
        const tabsToAdd = availableTabs.filter(t => selectedTabUrls.has(t.url))
        setTabs([...tabs, ...tabsToAdd])
        setMode('edit')
    }

    const handleSave = () => {
        if (tabs.length === 0) {
            return
        }
        onSave({
            ...session,
            tabs,
            updatedAt: Date.now(),
        })
    }

    const hasChanges = JSON.stringify(tabs) !== JSON.stringify(session.tabs)

    // Tab selection mode
    if (mode === 'selectTabs') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md h-full flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Select Tabs to Add
                        </h2>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleSelectAll}
                                className="text-xs text-indigo-500 hover:text-indigo-600"
                            >
                                Select All
                            </button>
                            <span className="text-xs text-gray-400">|</span>
                            <button
                                onClick={handleSelectNone}
                                className="text-xs text-gray-500 hover:text-gray-600"
                            >
                                Select None
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {availableTabs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>No new tabs to add</p>
                                <p className="text-sm">All current tabs are already in this session</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {availableTabs.map((tab) => (
                                    <label
                                        key={tab.url}
                                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTabUrls.has(tab.url)}
                                            onChange={() => handleToggleTab(tab.url)}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        {tab.favicon ? (
                                            <img src={tab.favicon} alt="" className="w-4 h-4 flex-shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />
                                        )}
                                        <span className="text-sm text-gray-900 dark:text-white truncate">
                                            {tab.title}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <button
                            onClick={() => setMode('edit')}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleAddSelectedTabs}
                            disabled={selectedTabUrls.size === 0}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add {selectedTabUrls.size} Tab{selectedTabUrls.size !== 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Main edit mode
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md h-full flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Session
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {session.name}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {tabs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No tabs in this session</p>
                            <p className="text-sm">Add tabs to continue</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {tabs.map((tab, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                                >
                                    {tab.favicon ? (
                                        <img src={tab.favicon} alt="" className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-white truncate">
                                            {tab.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {tab.url}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveTab(index)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove tab"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <button
                        onClick={handleShowTabSelector}
                        disabled={isLoading}
                        className="w-full px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Loading...' : '+ Add Tabs...'}
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={tabs.length === 0 || !hasChanges}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
