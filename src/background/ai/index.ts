import { ollamaProvider } from './ollama'
import { claudeProvider } from './claude'
import { getSettings } from '../../lib/storage'

// AI Provider interface
export interface AIProvider {
    name: string
    isAvailable: () => Promise<boolean>
    generateName: (tabTitles: string[]) => Promise<string>
}

// Prompt template for AI naming
export const AI_PROMPT = `You are a helpful assistant that creates short, descriptive names for browser tab sessions.

Given a list of tab titles, generate a concise 2-4 word name that captures the main theme or purpose of these tabs.

Rules:
- Keep it short: 2-4 words maximum
- Be descriptive but concise
- Use title case (e.g., "React Documentation Review")
- No punctuation or special characters
- Focus on the primary topic or activity

Tab titles:
{TAB_TITLES}

Respond with ONLY the session name, nothing else.`

// Generate session name using the configured AI provider
export async function generateSessionName(tabTitles: string[]): Promise<string> {
    const settings = await getSettings()

    // If AI naming is disabled, return default name
    if (!settings.aiNamingEnabled) {
        return getDefaultName()
    }

    try {
        // Select provider based on settings
        const provider = settings.aiProvider === 'ollama' ? ollamaProvider : claudeProvider

        // Check if selected provider is available
        const isAvailable = await provider.isAvailable()

        if (isAvailable) {
            const name = await provider.generateName(tabTitles)
            if (name && name.trim()) {
                return name.trim()
            }
        }

        // Fallback to other provider
        const fallbackProvider = settings.aiProvider === 'ollama' ? claudeProvider : ollamaProvider
        const fallbackAvailable = await fallbackProvider.isAvailable()

        if (fallbackAvailable) {
            const name = await fallbackProvider.generateName(tabTitles)
            if (name && name.trim()) {
                return name.trim()
            }
        }

        // If all providers fail, use default name
        return getDefaultName()
    } catch (error) {
        console.error('AI name generation failed:', error)
        return getDefaultName()
    }
}

// Get default session name
function getDefaultName(): string {
    return `Session - ${new Date().toLocaleDateString()}`
}

// Build prompt with tab titles
export function buildPrompt(tabTitles: string[]): string {
    const titles = tabTitles.slice(0, 10).join('\n- ')  // Limit to 10 tabs
    return AI_PROMPT.replace('{TAB_TITLES}', `- ${titles}`)
}
