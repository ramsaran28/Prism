export function PrivacyFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border pb-8 pt-6 text-center text-[14px] text-text-secondary ${className}`}
    >
      <p>
        Prism never stores your data. When you close this tab, everything is
        gone.
      </p>
    </footer>
  );
}
