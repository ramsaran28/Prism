"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface InfoModalContextValue {
  activeId: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

const InfoModalContext = createContext<InfoModalContextValue | null>(null);

export function InfoModalProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const openModal = useCallback((id: string) => setActiveId(id), []);
  const closeModal = useCallback(() => setActiveId(null), []);

  return (
    <InfoModalContext.Provider value={{ activeId, openModal, closeModal }}>
      {children}
    </InfoModalContext.Provider>
  );
}

export function useInfoModal() {
  const ctx = useContext(InfoModalContext);
  if (!ctx) {
    throw new Error("useInfoModal must be used within InfoModalProvider");
  }
  return ctx;
}
