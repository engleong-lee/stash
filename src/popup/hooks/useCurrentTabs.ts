import { useState, useEffect } from 'react'
import type { Tab } from '../../lib/types'

export function useCurrentTabs() {
    const [tabs, setTabs] = useState<Tab[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchTabs() {
            try {
                setIsLoading(true)
                const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TABS' })
                if (response.success) {
                    setTabs(response.data)
                } else {
                    setError(response.error || 'Failed to get tabs')
                }
            } catch (err) {
                setError((err as Error).message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTabs()
    }, [])

    return { tabs, tabCount: tabs.length, isLoading, error }
}
