import AbstractSection from "@/components/paper-detail/AbstractSection";
import CitationsSection from "@/components/paper-detail/CitationsSection";
import PaperTags from "@/components/paper-detail/PaperTags";
import ReferencesSection from "@/components/paper-detail/ReferencesSection";
import RelatedPapersSection, {
  type RelatedPaperItem,
} from "@/components/paper-detail/RelatedPapersSection";
import type { PaperReferenceItem } from "@/components/paper-detail/PaperReferenceList";

export type DataTabProps = {
  tags: string[];
  abstract?: string | null;
  references: PaperReferenceItem[];
  citations: PaperReferenceItem[];
  loading: boolean;
  onPaperSelect: (paper: PaperReferenceItem) => void;
  onAuthorSelect?: (paper: PaperReferenceItem) => void;
  relatedPapers?: RelatedPaperItem[];
  onRelatedSelect?: (paper: RelatedPaperItem) => void;
  onRelatedAuthorSelect?: (paper: RelatedPaperItem) => void;
};

export default function DataTab({
  tags,
  abstract,
  references,
  citations,
  loading,
  onPaperSelect,
  onAuthorSelect,
  relatedPapers,
  onRelatedSelect,
  onRelatedAuthorSelect,
}: DataTabProps) {
  return (
    <div className="space-y-6">
      <PaperTags tags={tags} />
      <AbstractSection abstract={abstract} />
      <div className="grid gap-6 sm:grid-cols-2">
        <ReferencesSection
          items={references}
          loading={loading}
          onPaperSelect={onPaperSelect}
          onAuthorSelect={onAuthorSelect}
        />
        <CitationsSection
          items={citations}
          loading={loading}
          onPaperSelect={onPaperSelect}
          onAuthorSelect={onAuthorSelect}
        />
      </div>
      {relatedPapers ? (
        <RelatedPapersSection
          papers={relatedPapers}
          onPaperSelect={onRelatedSelect ?? (() => {})}
          onAuthorSelect={onRelatedAuthorSelect}
        />
      ) : null}
    </div>
  );
}
