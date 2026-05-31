/** Prism mark — equilateral triangle + RGB refraction */
export function PrismIcon({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M10 3 L16.928 16 H3.072 L10 3 Z"
        stroke="#00C896"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <line
        x1="13.5"
        y1="11"
        x2="19"
        y2="8.5"
        stroke="#F04060"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="13.5"
        y1="11"
        x2="19"
        y2="11"
        stroke="#00C896"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="13.5"
        y1="11"
        x2="19"
        y2="13.5"
        stroke="#5B8DEF"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
