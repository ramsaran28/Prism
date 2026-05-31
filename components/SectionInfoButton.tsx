"use client";

import { useId, type ReactNode } from "react";
import { Info } from "lucide-react";
import { InfoModal } from "./InfoModal";
import { useInfoModal } from "./InfoModalContext";

interface SectionInfoButtonProps {
  modalTitle: string;
  ariaLabel: string;
  disclaimer?: string;
  children: ReactNode;
}

export function SectionInfoButton({
  modalTitle,
  ariaLabel,
  disclaimer,
  children,
}: SectionInfoButtonProps) {
  const modalId = useId();
  const { activeId, openModal, closeModal } = useInfoModal();
  const isOpen = activeId === modalId;

  return (
    <>
      <button
        type="button"
        onClick={() => openModal(modalId)}
        className="inline-flex shrink-0 align-middle transition-colors duration-150 ease-in-out"
        style={{ color: "#454760", cursor: "pointer", marginLeft: 8 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#8B8FA8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#454760";
        }}
        aria-label={ariaLabel}
      >
        <Info className="h-[14px] w-[14px]" strokeWidth={1.5} />
      </button>

      <InfoModal
        open={isOpen}
        onClose={closeModal}
        title={modalTitle}
        disclaimer={disclaimer}
      >
        {children}
      </InfoModal>
    </>
  );
}
