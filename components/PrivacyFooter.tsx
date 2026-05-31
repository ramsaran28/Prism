export function PrivacyFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border py-8 text-center text-sm text-text-secondary ${className}`}
    >
      <p>
        Prism never stores your data. When you close this tab, everything is
        gone.
      </p>
    </footer>
  );
}
