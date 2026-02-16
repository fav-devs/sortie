import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SwipeAction, VideoClip } from '@/lib/tauri-bindings'

export interface UndoEntry {
  clip: VideoClip
  action: SwipeAction
  originalPath: string
  removedIndex: number
}

interface OrganizerState {
  clips: VideoClip[]
  currentIndex: number
  processedCount: number
  undoStack: UndoEntry[]
  playbackRate: number
  isPlaying: boolean
  sourceDir: string | null

  setClips: (clips: VideoClip[]) => void
  setSourceDir: (path: string) => void
  nextClip: () => void
  applyDecision: (
    action: SwipeAction,
    originalPath?: string
  ) => UndoEntry | null
  undo: () => UndoEntry | null
  setPlaybackRate: (rate: number) => void
  setPlaying: (playing: boolean) => void
  reset: () => void
}

export const useOrganizerStore = create<OrganizerState>()(
  devtools(
    (set, get) => ({
      clips: [],
      currentIndex: 0,
      processedCount: 0,
      undoStack: [],
      playbackRate: 1.0,
      isPlaying: false,
      sourceDir: null,

      setClips: clips =>
        set(
          {
            clips,
            currentIndex: 0,
            processedCount: 0,
            undoStack: [],
          },
          undefined,
          'setClips'
        ),

      setSourceDir: path => set({ sourceDir: path }, undefined, 'setSourceDir'),

      nextClip: () =>
        set(
          state => ({
            currentIndex: Math.min(state.currentIndex + 1, state.clips.length),
          }),
          undefined,
          'nextClip'
        ),

      applyDecision: (action, originalPath) => {
        const state = get()
        const currentClip = state.clips[state.currentIndex]
        if (!currentClip) {
          return null
        }

        const removedIndex = state.currentIndex
        const undoEntry: UndoEntry = {
          clip: currentClip,
          action,
          originalPath: originalPath ?? currentClip.path,
          removedIndex,
        }

        set(
          prev => {
            const nextClips = [...prev.clips]
            nextClips.splice(removedIndex, 1)

            return {
              clips: nextClips,
              currentIndex: Math.min(removedIndex, nextClips.length),
              processedCount: prev.processedCount + 1,
              undoStack: [...prev.undoStack, undoEntry],
            }
          },
          undefined,
          'applyDecision'
        )

        return undoEntry
      },

      undo: () => {
        const state = get()
        const undoEntry = state.undoStack[state.undoStack.length - 1]
        if (!undoEntry) {
          return null
        }

        set(
          prev => {
            const nextUndoStack = prev.undoStack.slice(0, -1)
            const insertIndex = Math.min(
              undoEntry.removedIndex,
              prev.clips.length
            )
            const nextClips = [...prev.clips]
            nextClips.splice(insertIndex, 0, undoEntry.clip)

            return {
              clips: nextClips,
              undoStack: nextUndoStack,
              currentIndex: insertIndex,
              processedCount: Math.max(prev.processedCount - 1, 0),
            }
          },
          undefined,
          'undo'
        )

        return undoEntry
      },

      setPlaybackRate: rate =>
        set({ playbackRate: rate }, undefined, 'setPlaybackRate'),

      setPlaying: playing =>
        set({ isPlaying: playing }, undefined, 'setPlaying'),

      reset: () =>
        set(
          {
            clips: [],
            currentIndex: 0,
            processedCount: 0,
            undoStack: [],
            isPlaying: false,
            sourceDir: null,
          },
          undefined,
          'reset'
        ),
    }),
    { name: 'organizer-store' }
  )
)
