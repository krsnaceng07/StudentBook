import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * UI Store for managing theme and visual settings (Toasts, Theme, etc.)
 * 'isDarkMode' = Pure Black & White (Premium)
 */

export const useUIStore = create()(
  persist(
    (set) => ({
      // Theme State
      // false = Black & White (White background, Black text - like FB/LinkedIn)
      // true = Dark Mode (Original Blue theme #0F172A)
      isDarkMode: false, 
      
      // Toast State
      toast: {
        message: '',
        type: 'info',
        visible: false,
      },

      // Theme Actions
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (value) => set({ isDarkMode: value }),

      // Toast Actions
      showToast: (message, type = 'info') => set({
        toast: { message, type, visible: true }
      }),
      
      hideToast: () => set((state) => ({
        toast: { ...state.toast, visible: false }
      })),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist theme settings, not toasts
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);

export default useUIStore;
