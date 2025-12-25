import type { AIProvider } from './index'
import { buildPrompt } from './index'
import { getSettings } from '../../lib/storage'
import { OLLAMA_CONFIG } from '../../lib/constants'

// Ollama API response types
interface OllamaGenerateResponse {
    response: string
    done: boolean
}

interface OllamaModel {
    name: string
    modified_at: string
    size: number
}

interface OllamaTagsResponse {
    models: OllamaModel[]
}

// Check if Ollama is running
export async function isOllamaAvailable(): Promise<boolean> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)

        const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/tags`, {
            signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return response.ok
    } catch {
        return false
    }
}

// Get list of available Ollama models
export async function getAvailableModels(): Promise<string[]> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/tags`, {
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            return []
        }

        const data: OllamaTagsResponse = await response.json()
        return data.models.map(m => m.name)
    } catch {
        return []
    }
}

// Generate session name using Ollama
async function generateName(tabTitles: string[]): Promise<string> {
    const settings = await getSettings()
    let model = settings.ollamaModel || 'llama3.2:3b'

    // Check if the configured model is available, otherwise use first available
    const availableModels = await getAvailableModels()
    if (availableModels.length === 0) {
        throw new Error('No Ollama models available')
    }

    if (!availableModels.includes(model)) {
        model = availableModels[0]
    }

    const prompt = buildPrompt(tabTitles)

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.TIMEOUT_MS)

        const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 20,
                },
            }),
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            let errorText = ''
            try {
                errorText = await response.text()
            } catch {
                errorText = ''
            }

            if (response.status === 403) {
                throw new Error('Ollama CORS error. Please restart Ollama with: OLLAMA_ORIGINS="*" ollama serve')
            }

            throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
        }

        const data: OllamaGenerateResponse = await response.json()
        const cleaned = cleanResponse(data.response)

        if (!cleaned || cleaned.length < 2) {
            throw new Error('Empty response from Ollama')
        }

        return cleaned
    } catch (error) {
        console.error('Ollama generation error:', error)
        throw error
    }
}

// Clean up AI response
function cleanResponse(response: string): string {
    let cleaned = response
        .replace(/["']/g, '')
        .replace(/\n/g, ' ')
        .trim()

    const lines = cleaned.split(/[.\n]/)
    if (lines.length > 1) {
        cleaned = lines[0].trim()
    }

    const words = cleaned.split(/\s+/).slice(0, 5)
    return words.join(' ')
}

// Export as AIProvider
export const ollamaProvider: AIProvider = {
    name: 'Ollama',
    isAvailable: isOllamaAvailable,
    generateName,
}
