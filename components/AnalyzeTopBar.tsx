"use client";

export function AnalyzeTopBar() {
  return (
    <header
      className="flex shrink-0 items-center justify-between bg-sidebar"
      style={{
        height: 56,
        borderBottom: "0.5px solid #32364A",
        padding: "0 28px",
      }}
    >
      <p
        className="md:block"
        style={{
          fontSize: 17,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontWeight: 500,
          color: "#E8EAF2",
        }}
      >
        Health Analysis
      </p>
      <p
        style={{
          fontSize: 13,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          color: "#8E92A8",
        }}
      >
        Not medical advice. Always consult your doctor.
      </p>
    </header>
  );
}
