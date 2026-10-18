/** Placeholder content for a public page that is not built yet. The site layout adds the nav bar and footer. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-[#F7FBFA] px-6 py-24 text-center">
      <p className="text-xs font-semibold tracking-wide text-[#12939b]">COMING SOON</p>
      <h1 className="text-3xl font-bold text-[#1b2a5c]">{title}</h1>
      <p className="max-w-sm text-sm text-[#1b2a5c]/60">This screen is on the way — check back soon.</p>
    </div>
  );
}
