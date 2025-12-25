import type { Tab } from '../lib/types'

// Get all tabs in the current window
export async function getCurrentTabs(): Promise<Tab[]> {
    const tabs = await chrome.tabs.query({ currentWindow: true })

    return tabs
        .filter(tab => tab.url && !tab.url.startsWith('chrome://'))
        .map(tab => ({
            url: tab.url || '',
            title: tab.title || 'Untitled',
            favicon: tab.favIconUrl || '',
        }))
}

// Restore tabs from a session
export async function restoreTabs(
    tabs: Tab[],
    newWindow: boolean = true
): Promise<void> {
    if (tabs.length === 0) return

    if (newWindow) {
        // Create a new window with the first tab
        const newWin = await chrome.windows.create({
            url: tabs[0].url,
            focused: true,
        })
        const windowId = newWin?.id

        // Add remaining tabs to the new window
        if (windowId !== undefined && tabs.length > 1) {
            await Promise.all(
                tabs.slice(1).map(tab =>
                    chrome.tabs.create({
                        windowId: windowId,
                        url: tab.url,
                        active: false,
                    })
                )
            )
        }
    } else {
        // Open all tabs in current window
        await Promise.all(
            tabs.map((tab, index) =>
                chrome.tabs.create({
                    url: tab.url,
                    active: index === 0,
                })
            )
        )
    }
}

// Close tabs after saving (optional)
export async function closeCurrentTabs(): Promise<void> {
    const tabs = await chrome.tabs.query({ currentWindow: true })
    const tabIds = tabs
        .filter(tab => tab.id && !tab.url?.startsWith('chrome://'))
        .map(tab => tab.id as number)

    if (tabIds.length > 0) {
        // Keep at least one tab (create a new empty tab)
        await chrome.tabs.create({ active: true })
        await chrome.tabs.remove(tabIds)
    }
}
