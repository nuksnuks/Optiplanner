import create from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      setIsAuthenticated: (authState) => set({ isAuthenticated: authState }),
    }),
    {
      name: 'auth-storage', // unique name for the storage
      getStorage: () => localStorage, // use localStorage for persistence
    }
  )
);

export default useAuthStore;