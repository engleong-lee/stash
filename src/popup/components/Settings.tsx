import { useState, useEffect } from 'react'
import type { Settings as SettingsType } from '../../lib/types'
import { getSettings, saveSettings, getSessions } from '../../lib/storage'
import { DEFAULT_SETTINGS } from '../../lib/constants'

interface SettingsProps {
    onBack: () => void
}

// Check Ollama status response type
interface OllamaStatus {
    available: boolean
    models: string[]
}

export function Settings({ onBack }: SettingsProps) {
    const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null)
    const [sessionCount, setSessionCount] = useState(0)

    useEffect(() => {
        async function load() {
            try {
                const [loadedSettings, sessions] = await Promise.all([
                    getSettings(),
                    getSessions(),
                ])
                setSettings(loadedSettings)
                setSessionCount(sessions.length)
            } catch (error) {
                console.error('Failed to load settings:', error)
            } finally {
                setIsLoading(false)
            }
        }
        load()
        checkOllamaStatus()
    }, [])

    const checkOllamaStatus = async () => {
        try {
            const response = await fetch('http://localhost:11434/api/tags', {
                signal: AbortSignal.timeout(2000),
            })
            if (response.ok) {
                const data = await response.json()
                setOllamaStatus({
                    available: true,
                    models: data.models?.map((m: { name: string }) => m.name) || [],
                })
            } else {
                setOllamaStatus({ available: false, models: [] })
            }
        } catch {
            setOllamaStatus({ available: false, models: [] })
        }
    }

    const handleChange = async <K extends keyof SettingsType>(
        key: K,
        value: SettingsType[K]
    ) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        setIsSaving(true)
        try {
            await saveSettings({ [key]: value })
        } catch (error) {
            console.error('Failed to save settings:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleExport = async () => {
        try {
            const sessions = await getSessions()
            const exportData = {
                version: 1,
                exportedAt: new Date().toISOString(),
                sessions,
            }
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `stash-export-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export failed:', error)
        }
    }

    const handleImport = async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            try {
                const text = await file.text()
                const data = JSON.parse(text)

                if (data.sessions && Array.isArray(data.sessions)) {
                    // Import sessions by merging with existing
                    const existingSessions = await getSessions()
                    const existingIds = new Set(existingSessions.map(s => s.id))
                    const newSessions = data.sessions.filter((s: { id: string }) => !existingIds.has(s.id))

                    if (newSessions.length > 0) {
                        const allSessions = [...newSessions, ...existingSessions]
                        await chrome.storage.local.set({ stash_sessions: allSessions })
                        setSessionCount(allSessions.length)
                        alert(`Imported ${newSessions.length} new sessions!`)
                    } else {
                        alert('No new sessions to import (all sessions already exist)')
                    }
                }
            } catch (error) {
                console.error('Import failed:', error)
                alert('Failed to import sessions. Please check the file format.')
            }
        }
        input.click()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Settings
                {isSaving && <span className="ml-2 text-xs text-gray-400">(saving...)</span>}
            </h2>

            {/* AI Features Section */}
            <div className="mb-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    AI Features
                </h3>

                <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                        type="checkbox"
                        checked={settings.aiNamingEnabled}
                        onChange={(e) => handleChange('aiNamingEnabled', e.target.checked)}
                        className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Auto-suggest session names with AI
                    </span>
                </label>

                {settings.aiNamingEnabled && (
                    <div className="ml-6 space-y-3">
                        {/* Provider Selection */}
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">AI Provider:</p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="aiProvider"
                                        checked={settings.aiProvider === 'ollama'}
                                        onChange={() => handleChange('aiProvider', 'ollama')}
                                        className="w-4 h-4 text-indigo-500 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        🦙 Ollama (Local)
                                        {ollamaStatus !== null && (
                                            <span className={`ml-2 text-xs ${ollamaStatus.available ? 'text-green-500' : 'text-red-500'}`}>
                                                {ollamaStatus.available ? '✓ Running' : '✗ Not detected'}
                                            </span>
                                        )}
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="aiProvider"
                                        checked={settings.aiProvider === 'claude'}
                                        onChange={() => handleChange('aiProvider', 'claude')}
                                        className="w-4 h-4 text-indigo-500 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        ✨ Claude API (Anthropic)
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Ollama Model Selection */}
                        {settings.aiProvider === 'ollama' && ollamaStatus?.available && ollamaStatus.models.length > 0 && (
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                    Ollama Model:
                                </label>
                                <select
                                    value={settings.ollamaModel}
                                    onChange={(e) => handleChange('ollamaModel', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {ollamaStatus.models.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Claude API Key */}
                        {settings.aiProvider === 'claude' && (
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                    Claude API Key:
                                </label>
                                <input
                                    type="password"
                                    value={settings.claudeApiKey}
                                    onChange={(e) => handleChange('claudeApiKey', e.target.value)}
                                    placeholder="sk-ant-..."
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">console.anthropic.com</a>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Behavior Section */}
            <div className="mb-6">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Behavior
                </h3>

                {/* Restore behavior */}
                <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        After restoring a session:
                    </p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="restoreInNewWindow"
                                checked={settings.restoreInNewWindow}
                                onChange={() => handleChange('restoreInNewWindow', true)}
                                className="w-4 h-4 text-indigo-500 border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Open in new window
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="restoreInNewWindow"
                                checked={!settings.restoreInNewWindow}
                                onChange={() => handleChange('restoreInNewWindow', false)}
                                className="w-4 h-4 text-indigo-500 border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Open in current window
                            </span>
                        </label>
                    </div>
                </div>

                {/* Close tabs after save */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.closeTabsAfterSave}
                        onChange={(e) => handleChange('closeTabsAfterSave', e.target.checked)}
                        className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Close tabs after saving (default)
                    </span>
                </label>
            </div>

            {/* Data Section */}
            <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Data ({sessionCount} sessions)
                </h3>

                <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input
                        type="checkbox"
                        checked={settings.syncEnabled}
                        onChange={(e) => handleChange('syncEnabled', e.target.checked)}
                        className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Sync sessions across devices
                    </span>
                </label>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Export Sessions
                    </button>
                    <button
                        onClick={handleImport}
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Import Sessions
                    </button>
                </div>
            </div>

            {/* Version */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                    Stash v1.0.0
                </p>
            </div>
        </div>
    )
}
