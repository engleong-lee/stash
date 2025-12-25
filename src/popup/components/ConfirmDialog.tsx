interface ConfirmDialogProps {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    isDestructive?: boolean
}

export function ConfirmDialog({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDestructive = false,
}: ConfirmDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 mx-4 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {message}
                </p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-indigo-500 hover:bg-indigo-600'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
