"use client";

export function AnalyzeTopBar() {
  return (
    <header
      className="flex shrink-0 items-center justify-between bg-sidebar"
      style={{
        height: 56,
        borderBottom: "0.5px solid #232536",
        padding: "0 28px",
      }}
    >
      <p
        className="md:block"
        style={{
          fontSize: 15,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontWeight: 500,
          color: "#EEEEF0",
        }}
      >
        Health Analysis
      </p>
      <p
        style={{
          fontSize: 11,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          color: "#454760",
        }}
      >
        Not medical advice. Always consult your doctor.
      </p>
    </header>
  );
}
