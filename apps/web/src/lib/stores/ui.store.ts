import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  upgradeModalOpen: boolean;
  upgradeModalRequiredPlan: 'STARTER' | 'PRO' | 'ENTERPRISE' | null;
  setSidebarOpen: (open: boolean) => void;
  openUpgradeModal: (requiredPlan: 'STARTER' | 'PRO' | 'ENTERPRISE') => void;
  closeUpgradeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  upgradeModalOpen: false,
  upgradeModalRequiredPlan: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openUpgradeModal: (requiredPlan) =>
    set({ upgradeModalOpen: true, upgradeModalRequiredPlan: requiredPlan }),
  closeUpgradeModal: () =>
    set({ upgradeModalOpen: false, upgradeModalRequiredPlan: null }),
}));
