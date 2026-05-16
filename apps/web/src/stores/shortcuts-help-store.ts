import { create } from 'zustand'

interface State {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useShortcutsHelpStore = create<State>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))
