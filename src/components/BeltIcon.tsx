/** Martial-arts belt icon (tied knot with hanging tails), colored per rank */
export default function BeltIcon({ color, size = 52 }: { color: string; size?: number }) {
  const dark = color.toLowerCase() === "#f5f0e8" ? "#8a8578" : "rgba(0,0,0,0.35)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="belt-glow"
      style={{ color }}
      aria-hidden
    >
      {/* band */}
      <rect x="2" y="26" width="60" height="12" rx="3" fill={color} stroke={dark} strokeWidth="1.2" />
      {/* band stitching */}
      <line x1="4" y1="29" x2="60" y2="29" stroke={dark} strokeWidth="0.8" strokeDasharray="2.5 2.5" opacity="0.6" />
      <line x1="4" y1="35" x2="60" y2="35" stroke={dark} strokeWidth="0.8" strokeDasharray="2.5 2.5" opacity="0.6" />
      {/* knot */}
      <path d="M24 24 L40 24 L44 32 L40 40 L24 40 L20 32 Z" fill={color} stroke={dark} strokeWidth="1.4" />
      <path d="M24 24 L32 32 L24 40 M40 24 L32 32 L40 40" fill="none" stroke={dark} strokeWidth="1.1" opacity="0.7" />
      {/* tails */}
      <path d="M27 40 L22 58 L28 58 L31 42 Z" fill={color} stroke={dark} strokeWidth="1.2" />
      <path d="M37 40 L42 58 L36 58 L33 42 Z" fill={color} stroke={dark} strokeWidth="1.2" />
      {/* gold tip on black belt */}
      {color.toLowerCase() === "#1c1c1e" && (
        <>
          <rect x="22" y="53" width="6.5" height="5" fill="#c9a84c" />
          <rect x="35.5" y="53" width="6.5" height="5" fill="#c9a84c" />
        </>
      )}
    </svg>
  );
}
