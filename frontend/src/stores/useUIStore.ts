import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
    sidebarCollapsed: boolean;
    sidebarMobileOpen: boolean;
    theme: "dark" | "light";
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleMobileSidebar: () => void;
    setTheme: (theme: "dark" | "light") => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            sidebarMobileOpen: false,
            theme: "dark",
            toggleSidebar: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) =>
                set({ sidebarCollapsed: collapsed }),
            toggleMobileSidebar: () =>
                set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "ui-storage",
        }
    )
);
