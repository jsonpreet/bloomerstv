import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ViewType } from '../../graphql/generated'
export enum PlayerStreamingMode {
  Quality = 'Quality',
  LowLatency = 'Low Latency'
}
interface MyPreferencesStore {
  playerStreamingMode: PlayerStreamingMode
  setPlayerStreamingMode: (playerStreamingMode: PlayerStreamingMode) => void
  liveChatPopUpSound: boolean
  setLiveChatPopUpSound: (liveChatPopUpSound: boolean) => void
  streamReplayViewType: ViewType
  setStreamReplayViewType: (viewType: ViewType) => void
  category: string
  setCategory: (category: string) => void
}

export const useMyPreferences = create<MyPreferencesStore>(
  persist(
    (set) => ({
      playerStreamingMode: PlayerStreamingMode.LowLatency,
      setPlayerStreamingMode: (playerStreamingMode) =>
        set(() => ({ playerStreamingMode })),
      liveChatPopUpSound: true,
      setLiveChatPopUpSound: (liveChatPopUpSound) =>
        set(() => ({ liveChatPopUpSound })),
      streamReplayViewType: ViewType.Public,
      setStreamReplayViewType: (viewType) =>
        set(() => ({ streamReplayViewType: viewType })),
      category: 'Gaming',
      setCategory: (category) => set(() => ({ category }))
    }),
    {
      name: 'myPreferences',
      partialize: (state: MyPreferencesStore) => {
        // allow persisting only the `liveChatPopUpSound` state
        return {
          liveChatPopUpSound: state.liveChatPopUpSound,
          streamReplayViewType: state.streamReplayViewType,
          category: state.category,
          playerStreamingMode: state.playerStreamingMode
        }
      }
    }
  ) as any
)
