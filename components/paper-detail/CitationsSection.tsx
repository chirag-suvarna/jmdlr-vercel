import PaperReferenceList, {
  type PaperReferenceItem,
} from "@/components/paper-detail/PaperReferenceList";

export type CitationsSectionProps = {
  items: PaperReferenceItem[];
  loading?: boolean;
  onPaperSelect: (paper: PaperReferenceItem) => void;
  onAuthorSelect?: (paper: PaperReferenceItem) => void;
};

export default function CitationsSection({
  items,
  loading,
  onPaperSelect,
  onAuthorSelect,
}: CitationsSectionProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
        Citations
      </p>
      <PaperReferenceList
        items={items}
        loading={loading}
        emptyMessage="No citations available."
        onPaperSelect={onPaperSelect}
        onAuthorSelect={onAuthorSelect}
      />
    </div>
  );
}
