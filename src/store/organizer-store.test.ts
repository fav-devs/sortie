import { beforeEach, describe, expect, it } from 'vitest'
import type { SwipeAction, VideoClip } from '@/lib/tauri-bindings'
import { useOrganizerStore } from './organizer-store'

const clip = (id: string): VideoClip => ({
  id,
  path: `/tmp/${id}.mp4`,
  filename: `${id}.mp4`,
  size: 100,
  duration_secs: 0,
  format: 'mp4',
})

const skipAction: SwipeAction = { type: 'Skip' }

describe('organizer store', () => {
  beforeEach(() => {
    useOrganizerStore.setState({
      clips: [],
      currentIndex: 0,
      processedCount: 0,
      undoStack: [],
      playbackRate: 1,
      isPlaying: false,
    })
  })

  it('sets clips and resets queue state', () => {
    useOrganizerStore.getState().setClips([clip('a'), clip('b')])
    const state = useOrganizerStore.getState()
    expect(state.clips).toHaveLength(2)
    expect(state.currentIndex).toBe(0)
    expect(state.processedCount).toBe(0)
    expect(state.undoStack).toHaveLength(0)
  })

  it('applies a decision by removing current clip and pushing undo entry', () => {
    const store = useOrganizerStore.getState()
    store.setClips([clip('a'), clip('b')])

    const entry = useOrganizerStore.getState().applyDecision(skipAction, '/tmp/processed/a.mp4')
    const state = useOrganizerStore.getState()

    expect(entry).not.toBeNull()
    expect(state.clips.map(c => c.id)).toEqual(['b'])
    expect(state.currentIndex).toBe(0)
    expect(state.processedCount).toBe(1)
    expect(state.undoStack).toHaveLength(1)
    expect(state.undoStack[0]?.currentPath).toBe('/tmp/processed/a.mp4')
  })

  it('undoes last decision and restores clip to original position', () => {
    const store = useOrganizerStore.getState()
    store.setClips([clip('a'), clip('b'), clip('c')])
    store.applyDecision(skipAction, '/tmp/processed/a.mp4') // removes a
    store.applyDecision(skipAction, '/tmp/processed/b.mp4') // removes b

    const undone = useOrganizerStore.getState().undo()
    const state = useOrganizerStore.getState()

    expect(undone).not.toBeNull()
    if (!undone) {
      throw new Error('Expected an undo entry')
    }

    expect(undone.clip.id).toBe('b')
    expect(state.clips.map(c => c.id)).toEqual(['b', 'c'])
    expect(state.currentIndex).toBe(0)
    expect(state.processedCount).toBe(1)

    expect(state.undoStack).toHaveLength(1)
  })
})
