import { useState, useMemo, useEffect } from 'react'
import type { Session } from '../../lib/types'

export function useSearch(sessions: Session[]) {
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    // Debounce the query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 100)

        return () => clearTimeout(timer)
    }, [query])

    // Filter sessions based on debounced query
    const filteredSessions = useMemo(() => {
        if (!debouncedQuery.trim()) {
            return sessions
        }

        const searchTerm = debouncedQuery.toLowerCase()

        return sessions.filter((session) => {
            // Search in session name
            if (session.name.toLowerCase().includes(searchTerm)) {
                return true
            }

            // Search in tab titles and URLs
            return session.tabs.some(
                (tab) =>
                    tab.title.toLowerCase().includes(searchTerm) ||
                    tab.url.toLowerCase().includes(searchTerm)
            )
        })
    }, [sessions, debouncedQuery])

    return {
        query,
        setQuery,
        filteredSessions,
        hasResults: filteredSessions.length > 0,
        isSearching: query.trim().length > 0,
    }
}
