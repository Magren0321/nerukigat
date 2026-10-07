export function SplitPageHeading({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <>
      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
        {label}
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-zinc-950 dark:text-zinc-50">
        {title}
      </h1>
    </>
  );
}
