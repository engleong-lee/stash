interface StashButtonProps {
    tabCount: number
    onClick: () => void
    disabled?: boolean
}

export function StashButton({ tabCount, onClick, disabled }: StashButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Stash All Tabs ({tabCount})</span>
        </button>
    )
}
