import { PrismIcon } from "./PrismIcon";

interface PrismLogoProps {
  className?: string;
  iconSize?: number;
}

export function PrismLogo({ className = "", iconSize = 20 }: PrismLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PrismIcon size={iconSize} />
      <span className="logo-text">Prism</span>
    </div>
  );
}
