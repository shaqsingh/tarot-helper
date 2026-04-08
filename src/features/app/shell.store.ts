import { create } from 'zustand'

type ShellState = {
  detailsPanelOpen: boolean
  toggleDetailsPanel: () => void
}

export const useShellStore = create<ShellState>((set) => ({
  detailsPanelOpen: true,
  toggleDetailsPanel: () =>
    set((s) => ({ detailsPanelOpen: !s.detailsPanelOpen })),
}))
