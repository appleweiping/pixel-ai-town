import { create } from 'zustand'

export interface Agent {
  id: string
  name: string
  role: string
  x: number
  y: number
  state: 'idle' | 'walking' | 'working' | 'talking'
  mood: string
  activity: string
}

interface GameState {
  agents: Agent[]
  selectedAgent: string | null
  dialogueHistory: { role: string; content: string }[]
  connected: boolean
  setAgents: (agents: Agent[]) => void
  selectAgent: (id: string | null) => void
  addDialogue: (msg: { role: string; content: string }) => void
  clearDialogue: () => void
  setConnected: (v: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  agents: [
    { id: 'opus', name: 'Opus 总舵主', role: 'Chief Architect', x: 768, y: 300, state: 'idle', mood: 'thoughtful', activity: 'planning' },
    { id: 'pixelcat', name: '像素猫 PixelCat', role: 'Full-Stack Executor', x: 280, y: 420, state: 'idle', mood: 'calm', activity: 'coding' },
    { id: 'sonnet', name: 'Sonnet 审查员', role: 'Code Reviewer', x: 450, y: 220, state: 'idle', mood: 'focused', activity: 'reviewing' },
    { id: 'codex', name: 'Codex 协调官', role: 'Coordinator', x: 900, y: 580, state: 'idle', mood: 'energetic', activity: 'coordinating' },
    { id: 'haiku', name: 'Haiku 闪电侠', role: 'Speed Runner', x: 650, y: 770, state: 'idle', mood: 'swift', activity: 'sprinting' },
    { id: 'deepseek', name: '鲸鱼 DeepSeek', role: 'Bulk Worker', x: 1100, y: 600, state: 'idle', mood: 'steady', activity: 'processing' },
    { id: 'aris', name: 'ARIS 科研框架', role: 'Research Framework', x: 1100, y: 220, state: 'idle', mood: 'systematic', activity: 'researching' },
  ],
  selectedAgent: null,
  dialogueHistory: [],
  connected: false,
  setAgents: (agents) => set({ agents }),
  selectAgent: (id) => set({ selectedAgent: id, dialogueHistory: [] }),
  addDialogue: (msg) => set((s) => ({ dialogueHistory: [...s.dialogueHistory, msg] })),
  clearDialogue: () => set({ dialogueHistory: [] }),
  setConnected: (v) => set({ connected: v }),
}))
