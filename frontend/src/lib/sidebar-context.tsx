"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
interface SidebarContextType {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}
const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  mobileOpen: false,
  toggle: () => {},
  openMobile: () => {},
  closeMobile: () => {},
});
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, toggle, openMobile, closeMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
export function useSidebar() {
  return useContext(SidebarContext);
}
