export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-6 py-10 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-4 text-sm text-[color:var(--color-text-secondary)] md:flex-row md:items-center">
        <div>© 2024 JMDLR</div>
        <div className="flex items-center gap-6">
          <span className="transition hover:text-[color:var(--color-text-primary)]">
            Privacy
          </span>
          <span className="transition hover:text-[color:var(--color-text-primary)]">
            Terms
          </span>
          <span className="transition hover:text-[color:var(--color-text-primary)]">
            Contact
          </span>
        </div>
      </div>
    </footer>
  );
}
