import { create } from 'zustand'

type ViewType = 'main' | 'save' | 'select' | 'settings'

interface UIState {
    currentView: ViewType
    setView: (view: ViewType) => void
}

export const useUIStore = create<UIState>((set) => ({
    currentView: 'main',
    setView: (view) => set({ currentView: view }),
}))
