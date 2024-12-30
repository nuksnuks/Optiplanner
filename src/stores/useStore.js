import create from 'zustand';

const useStore = create((set) => ({
  // Define your state and actions here
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  // Add other state and actions as needed
}));

export default useStore;