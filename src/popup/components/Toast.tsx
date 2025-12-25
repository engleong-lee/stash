import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
    message: string
    type?: ToastType
    duration?: number
    onClose: () => void
    action?: {
        label: string
        onClick: () => void
    }
}

export function Toast({ message, type = 'success', duration = 2000, onClose, action }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 200) // Wait for fade out animation
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-indigo-500',
    }[type]

    const icon = {
        success: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    }[type]

    const handleActionClick = () => {
        if (action) {
            action.onClick()
            setIsVisible(false)
            setTimeout(onClose, 200)
        }
    }

    return (
        <div
            className={`fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 ${bgColor} text-white text-sm font-medium rounded-lg shadow-lg transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
        >
            {icon}
            <span>{message}</span>
            {action && (
                <button
                    onClick={handleActionClick}
                    className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
