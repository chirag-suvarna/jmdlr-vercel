export type PaperTitleProps = {
  title: string;
};

export default function PaperTitle({ title }: PaperTitleProps) {
  return (
    <h2 className="text-2xl font-semibold leading-tight text-[color:var(--color-text-primary)] sm:text-3xl">
      {title}
    </h2>
  );
}
