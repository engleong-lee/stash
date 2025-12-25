// Background service worker for Stash extension
import { setupMessageHandlers } from './storage'
import { getCurrentTabs } from './tabs'
import { generateId, saveSession } from '../lib/storage'
import type { Session } from '../lib/types'

console.log('Stash background service worker loaded')

// Set up message handlers
setupMessageHandlers()

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Stash extension installed')
})

// Listen for quick-stash command
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'quick-stash') {
        console.log('Quick stash command received')

        try {
            // Get current tabs
            const tabs = await getCurrentTabs()

            if (tabs.length === 0) {
                // Show notification that there are no tabs to save
                await showNotification('No Tabs', 'No tabs to stash in the current window.')
                return
            }

            // Generate a default name
            const defaultName = `Session - ${new Date().toLocaleDateString()}`

            // Create and save session
            const session: Session = {
                id: generateId(),
                name: defaultName,
                tabs,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }

            await saveSession(session)

            // Show success notification
            await showNotification(
                'Stashed!',
                `Saved ${tabs.length} tabs as "${defaultName}"`
            )
        } catch (error) {
            console.error('Quick stash error:', error)
            await showNotification('Error', 'Failed to stash tabs. Please try again.')
        }
    }
})

// Helper function to show notifications
async function showNotification(title: string, message: string): Promise<void> {
    // Note: This requires the "notifications" permission in manifest.json
    // For now, we'll use a simpler approach with console logging
    console.log(`[Stash] ${title}: ${message}`)

    // If notifications are enabled, use chrome.notifications.create
    // For now, this is a placeholder for Phase 3 when we add notification permission
}

export { }
