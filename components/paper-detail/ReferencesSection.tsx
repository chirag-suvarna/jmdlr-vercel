import PaperReferenceList, {
  type PaperReferenceItem,
} from "@/components/paper-detail/PaperReferenceList";

export type ReferencesSectionProps = {
  items: PaperReferenceItem[];
  loading?: boolean;
  onPaperSelect: (paper: PaperReferenceItem) => void;
  onAuthorSelect?: (paper: PaperReferenceItem) => void;
};

export default function ReferencesSection({
  items,
  loading,
  onPaperSelect,
  onAuthorSelect,
}: ReferencesSectionProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
        References
      </p>
      <PaperReferenceList
        items={items}
        loading={loading}
        emptyMessage="No references available."
        onPaperSelect={onPaperSelect}
        onAuthorSelect={onAuthorSelect}
      />
    </div>
  );
}
