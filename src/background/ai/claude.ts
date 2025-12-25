import type { AIProvider } from './index'
import { buildPrompt } from './index'
import { getSettings } from '../../lib/storage'

// Claude API base URL
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-3-haiku-20240307'
const CLAUDE_TIMEOUT_MS = 10000

// Claude API response types
interface ClaudeResponse {
    id: string
    content: Array<{
        type: 'text'
        text: string
    }>
    model: string
    stop_reason: string
}

// Check if Claude API is available (has API key)
async function isClaudeAvailable(): Promise<boolean> {
    try {
        const settings = await getSettings()
        return Boolean(settings.claudeApiKey && settings.claudeApiKey.trim())
    } catch {
        return false
    }
}

// Generate session name using Claude API
async function generateName(tabTitles: string[]): Promise<string> {
    const settings = await getSettings()
    const apiKey = settings.claudeApiKey

    if (!apiKey) {
        throw new Error('Claude API key not configured')
    }

    const prompt = buildPrompt(tabTitles)

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT_MS)

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 50,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Claude API error: ${response.status} - ${error}`)
        }

        const data: ClaudeResponse = await response.json()

        if (data.content && data.content.length > 0 && data.content[0].type === 'text') {
            return cleanResponse(data.content[0].text)
        }

        throw new Error('No response from Claude')
    } catch (error) {
        console.error('Claude generation error:', error)
        throw error
    }
}

// Clean up AI response
function cleanResponse(response: string): string {
    // Remove quotes, newlines, and extra whitespace
    let cleaned = response
        .replace(/["']/g, '')
        .replace(/\n/g, ' ')
        .trim()

    // Take only first line if multiple lines
    const lines = cleaned.split(/[.\n]/)
    if (lines.length > 1) {
        cleaned = lines[0].trim()
    }

    // Limit to first 5 words
    const words = cleaned.split(/\s+/).slice(0, 5)
    return words.join(' ')
}

// Export as AIProvider
export const claudeProvider: AIProvider = {
    name: 'Claude',
    isAvailable: isClaudeAvailable,
    generateName,
}
