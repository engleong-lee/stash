import { useState } from 'react'
import type { Tab } from '../../lib/types'

interface TabSelectorProps {
    tabs: Tab[]
    onCancel: () => void
    onSelect: (selectedTabs: Tab[]) => void
}

export function TabSelector({ tabs, onCancel, onSelect }: TabSelectorProps) {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
        new Set(tabs.map((_, i) => i))
    )

    const toggleTab = (index: number) => {
        const newSelected = new Set(selectedIndices)
        if (newSelected.has(index)) {
            newSelected.delete(index)
        } else {
            newSelected.add(index)
        }
        setSelectedIndices(newSelected)
    }

    const selectAll = () => {
        setSelectedIndices(new Set(tabs.map((_, i) => i)))
    }

    const selectNone = () => {
        setSelectedIndices(new Set())
    }

    const handleSubmit = () => {
        const selectedTabs = tabs.filter((_, i) => selectedIndices.has(i))
        onSelect(selectedTabs)
    }

    const selectedCount = selectedIndices.size

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select tabs to stash:
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                    >
                        All
                    </button>
                    <button
                        onClick={selectNone}
                        className="text-xs text-gray-500 hover:text-gray-600 font-medium"
                    >
                        None
                    </button>
                </div>
            </div>

            {/* Tab list */}
            <div className="flex-1 overflow-y-auto max-h-48 space-y-1 mb-4">
                {tabs.map((tab, index) => (
                    <label
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                        <input
                            type="checkbox"
                            checked={selectedIndices.has(index)}
                            onChange={() => toggleTab(index)}
                            className="w-4 h-4 text-indigo-500 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                        />
                        {tab.favicon ? (
                            <img src={tab.favicon} alt="" className="w-4 h-4 flex-shrink-0" />
                        ) : (
                            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {tab.title}
                        </span>
                    </label>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={selectedCount === 0}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                    Stash Selected ({selectedCount})
                </button>
            </div>
        </div>
    )
}
