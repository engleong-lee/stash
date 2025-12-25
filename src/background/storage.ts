import type { MessageType, MessageResponse } from '../lib/types'
import * as storage from '../lib/storage'
import * as tabs from './tabs'
import { generateSessionName } from './ai/index'

// Handle messages from popup
export function setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener(
        (
            message: MessageType,
            _sender: chrome.runtime.MessageSender,
            sendResponse: (response: MessageResponse) => void
        ) => {
            handleMessage(message)
                .then(sendResponse)
                .catch(error => {
                    console.error('Message handler error:', error)
                    sendResponse({ success: false, error: (error as Error).message })
                })

            return true // Keep message channel open for async response
        }
    )
}

async function handleMessage(message: MessageType): Promise<MessageResponse> {
    switch (message.type) {
        case 'GET_CURRENT_TABS': {
            const currentTabs = await tabs.getCurrentTabs()
            return { success: true, data: currentTabs }
        }

        case 'GET_SESSIONS': {
            const sessions = await storage.getSessions()
            return { success: true, data: sessions }
        }

        case 'SAVE_SESSION': {
            await storage.saveSession(message.session)
            return { success: true }
        }

        case 'RESTORE_SESSION': {
            const sessions = await storage.getSessions()
            const session = sessions.find(s => s.id === message.sessionId)

            if (!session) {
                return { success: false, error: 'Session not found' }
            }

            await tabs.restoreTabs(session.tabs, message.newWindow ?? true)
            return { success: true, data: { tabCount: session.tabs.length } }
        }

        case 'DELETE_SESSION': {
            await storage.deleteSession(message.sessionId)
            return { success: true }
        }

        case 'UPDATE_SESSION': {
            await storage.updateSession(message.session.id, {
                name: message.session.name,
                tabs: message.session.tabs,
            })
            return { success: true }
        }

        case 'GENERATE_SESSION_NAME': {
            try {
                const name = await generateSessionName(message.tabTitles)
                return { success: true, data: name }
            } catch (error) {
                console.error('AI name generation failed:', error)
                const defaultName = `Session - ${new Date().toLocaleDateString()}`
                return { success: true, data: defaultName }
            }
        }

        default:
            return { success: false, error: 'Unknown message type' }
    }
}
