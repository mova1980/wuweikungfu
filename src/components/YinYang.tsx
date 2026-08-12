export default function YinYang({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="yygold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d98c" />
          <stop offset="55%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#8a6d25" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#yygold)" strokeWidth="2.5" />
      <path d="M50 2 a48 48 0 0 1 0 96 a24 24 0 0 1 0-48 a24 24 0 0 0 0-48Z" fill="url(#yygold)" />
      <circle cx="50" cy="26" r="7" fill="url(#yygold)" />
      <circle cx="50" cy="74" r="7" fill="#0A0A0A" />
    </svg>
  );
}
