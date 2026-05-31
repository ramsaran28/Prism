import type { ReactNode } from "react";

interface InfoBulletProps {
  children: ReactNode;
  color?: string;
}

export function InfoBullet({ children, color = "#8B8FA8" }: InfoBulletProps) {
  return (
    <div className="flex items-start" style={{ gap: 8, marginBottom: 8 }}>
      <span className="shrink-0 leading-[1.75]" style={{ color }} aria-hidden>
        ●
      </span>
      <span>{children}</span>
    </div>
  );
}
