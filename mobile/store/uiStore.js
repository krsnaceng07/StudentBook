import { create } from 'zustand';

export const useUIStore = create((set) => ({
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  showToast: (message, type = 'info') => {
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    });
  },
  hideToast: () => {
    set((state) => ({
      toast: {
        ...state.toast,
        visible: false,
      },
    }));
  },
}));
