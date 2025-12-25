import { useState, useEffect } from 'react'
import type { Tab, Session } from '../../lib/types'
import { generateId, getSettings } from '../../lib/storage'

interface SaveDialogProps {
    tabs: Tab[]
    onSave: (session: Session, closeTabs: boolean) => void
    onCancel: () => void
}

export function SaveDialog({ tabs, onSave, onCancel }: SaveDialogProps) {
    const [name, setName] = useState('')
    const [closeTabs, setCloseTabs] = useState(false)
    const [isGenerating, setIsGenerating] = useState(true)
    const [aiProvider, setAiProvider] = useState<'ollama' | 'claude' | null>(null)
    const [isTakingLong, setIsTakingLong] = useState(false)

    // Generate AI name on mount
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>

        async function generateName() {
            try {
                // Check settings to show provider indicator
                const settings = await getSettings()
                if (settings.aiNamingEnabled) {
                    setAiProvider(settings.aiProvider)
                }

                // Set timeout for "taking longer" message
                timeoutId = setTimeout(() => {
                    setIsTakingLong(true)
                }, 3000)

                const tabTitles = tabs.map(t => t.title)
                const response = await chrome.runtime.sendMessage({
                    type: 'GENERATE_SESSION_NAME',
                    tabTitles,
                })
                if (response.success && response.data) {
                    setName(response.data)
                }
            } catch {
                // Use default name on error
                setName(`Session - ${new Date().toLocaleDateString()}`)
            } finally {
                clearTimeout(timeoutId)
                setIsGenerating(false)
                setIsTakingLong(false)
            }
        }

        generateName()

        return () => clearTimeout(timeoutId)
    }, [tabs])

    const handleSave = () => {
        const session: Session = {
            id: generateId(),
            name: name.trim() || `Session - ${new Date().toLocaleDateString()}`,
            tabs,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        onSave(session, closeTabs)
    }

    const handleSkipAI = () => {
        setName(`Session - ${new Date().toLocaleDateString()}`)
        setIsGenerating(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isGenerating) {
            handleSave()
        } else if (e.key === 'Escape') {
            onCancel()
        }
    }

    const getProviderIcon = () => {
        if (!aiProvider) return '✨'
        return aiProvider === 'ollama' ? '🦙' : '✨'
    }

    const getProviderName = () => {
        if (!aiProvider) return 'AI'
        return aiProvider === 'ollama' ? 'Ollama' : 'Claude'
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name this session:
            </label>

            <div className="relative mb-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter session name..."
                    disabled={isGenerating}
                    autoFocus
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
                />
                {isGenerating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                )}
            </div>

            {isGenerating ? (
                <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isTakingLong ? (
                            <span>
                                Taking longer than expected...{' '}
                                <button
                                    onClick={handleSkipAI}
                                    className="text-indigo-500 hover:underline"
                                >
                                    Skip and use default
                                </button>
                            </span>
                        ) : (
                            `${getProviderIcon()} Generating with ${getProviderName()}...`
                        )}
                    </p>
                </div>
            ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {getProviderIcon()} Suggested by {getProviderName()}
                </p>
            )}

            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isGenerating}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                    Save ({tabs.length} tabs)
                </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                    type="checkbox"
                    checked={closeTabs}
                    onChange={(e) => setCloseTabs(e.target.checked)}
                    className="w-4 h-4 text-indigo-500 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                />
                Close tabs after saving
            </label>
        </div>
    )
}
