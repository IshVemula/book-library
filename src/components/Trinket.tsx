import type { TrinketKind } from "@/lib/trinkets";

// Small hand-drawn shelf ornaments. Every drawing uses a 40×60 box with the
// shelf at y = 60, so they all stand on the plank. Generic objects only: no
// official character art or logos.

const GOLD = "#d6a73c";
const GOLD_LIGHT = "#f6dd8a";
const WOOD = "#6b4428";
const WOOD_DARK = "#3e2716";
const GLASS = "rgba(205, 228, 240, 0.16)";
const GLASS_EDGE = "rgba(220, 236, 244, 0.6)";
const CORK = "#8a5a34";

const glow = (cx: number, cy: number, color: string) => (
  <>
    <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.1} />
    <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.16} />
  </>
);

const DRAWINGS: Record<TrinketKind, React.ReactNode> = {
  ring: (
    <>
      <rect x="7" y="50" width="26" height="10" rx="2" fill="#5b1f2b" />
      <rect x="7" y="50" width="26" height="3" rx="1" fill="#7c2c3d" />
      <ellipse cx="20" cy="40" rx="9" ry="10" fill="none" stroke={GOLD} strokeWidth="3.5" />
      <path d="M13.5 34 a9 10 0 0 1 7 -4" fill="none" stroke={GOLD_LIGHT} strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  wand: (
    <>
      <line x1="12" y1="59" x2="30" y2="8" stroke="#6a4528" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="12" y1="59" x2="16.5" y2="46" stroke={WOOD_DARK} strokeWidth="4.2" strokeLinecap="round" />
      <circle cx="14.5" cy="51" r="1" fill={GOLD} />
      <path d="M31 1.5 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2z" fill="#ffe9a8" />
      <circle cx="35" cy="12" r="0.9" fill="#ffe9a8" />
      <circle cx="26" cy="4" r="0.7" fill="#ffe9a8" />
    </>
  ),
  pipe: (
    <>
      <path d="M3 58 Q13 51 24 52" fill="none" stroke="#2c1a0f" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 44 h11 v11 a5.5 5 0 0 1 -11 0 z" fill="#7a4524" />
      <path d="M26 46 v9" stroke="#9a5e34" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="29.5" cy="44" rx="5.5" ry="1.6" fill="#2a170c" />
      <path d="M28 40 q2 -3 0 -6 q-2 -3 1 -6" fill="none" stroke="#d8d2c8" strokeOpacity="0.45" strokeWidth="1" />
    </>
  ),
  magnifier: (
    <>
      <line x1="13" y1="58" x2="21.5" y2="37" stroke={WOOD_DARK} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="26" cy="26" r="11" fill={GLASS} stroke={GOLD} strokeWidth="3" />
      <path d="M20 22 a7 7 0 0 1 6 -4.5" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  watch: (
    <>
      <path d="M19 24 q-9 -16 -16 -6 q-2 4 1 8" fill="none" stroke={GOLD} strokeWidth="1.1" strokeDasharray="1.6 1" />
      <rect x="17.5" y="22" width="5" height="5" rx="1.2" fill={GOLD} />
      <circle cx="20" cy="43" r="16" fill={GOLD} />
      <circle cx="20" cy="43" r="13" fill="#f4ecd8" />
      {[0, 90, 180, 270].map((a) => (
        <circle key={a} cx={20 + 10.5 * Math.sin((a * Math.PI) / 180)} cy={43 - 10.5 * Math.cos((a * Math.PI) / 180)} r="0.9" fill="#3a2a1e" />
      ))}
      <line x1="20" y1="43" x2="20" y2="35" stroke="#2a1c10" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="43" x2="25.5" y2="46" stroke="#2a1c10" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 36 a13 13 0 0 1 8 -5.5" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" />
    </>
  ),
  teacup: (
    <>
      <path d="M14 34 q-3 -4 0 -8 q3 -4 0 -8 M21 33 q-3 -4 0 -8 q3 -4 0 -8" fill="none" stroke="#efe6d6" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="20" cy="57" rx="16" ry="3" fill="#e4dbc9" />
      <path d="M30 43 a5 5 0 0 1 0 9" fill="none" stroke="#f3ede2" strokeWidth="3" />
      <path d="M8 40 h22 v5 a11 11 0 0 1 -22 0 z" fill="#f3ede2" />
      <rect x="8" y="41.5" width="22" height="2.4" fill="#b8574a" />
      <ellipse cx="19" cy="40" rx="11" ry="2" fill="#7a4a2a" />
    </>
  ),
  raven: (
    <>
      <path d="M12 52 C10 42 15 33 23 30 C24 26 27 23.5 31 24.5 L37.5 26 L31.5 28 C32 35 30 42 27 48 L33 56 L24 51 Z" fill="#121212" />
      <path d="M15 46 C17 40 21 35 26 34" fill="none" stroke="#2f2f35" strokeWidth="1.4" />
      <circle cx="30.5" cy="27" r="0.9" fill="#d9c27a" />
      <path d="M20 50 L19 59 M23.5 50 L23.5 59" stroke="#121212" strokeWidth="1.3" />
      <path d="M16 59 h10" stroke="#121212" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  skull: (
    <>
      <path d="M8 38 a12 12 0 0 1 24 0 v6 a3 3 0 0 1 -3 3 h-1 v5 h-16 v-5 h-1 a3 3 0 0 1 -3 -3 z" fill="#ece3cf" />
      <rect x="12" y="51" width="16" height="7" rx="2" fill="#e0d6c0" />
      <path d="M15.5 51 v7 M20 51 v7 M24.5 51 v7" stroke="#b9ac92" strokeWidth="0.8" />
      <ellipse cx="15" cy="40" rx="3.3" ry="3.7" fill="#2a1d14" />
      <ellipse cx="25" cy="40" rx="3.3" ry="3.7" fill="#2a1d14" />
      <path d="M20 44.5 l-1.7 3 h3.4 z" fill="#2a1d14" />
      <path d="M11 33 a10 10 0 0 1 6 -6" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" />
    </>
  ),
  whale: (
    <>
      <rect x="10" y="55" width="20" height="5" rx="1" fill={WOOD} />
      <line x1="20" y1="47" x2="20" y2="55" stroke={WOOD_DARK} strokeWidth="2" />
      <path d="M4 38 C6 29 22 27 30 34 L36.5 27.5 L35 36 L38.5 42 L31 40 C26 48 8 48 4 38 Z" fill="#e6e1d6" />
      <path d="M6 41 C12 46 24 46 30 40" fill="none" stroke="#b9b2a6" strokeWidth="1.2" />
      <circle cx="10" cy="36.5" r="1" fill="#2a2a2a" />
      <path d="M12 29 q-2 -5 -5 -6 M12 29 q1 -5 4 -7" fill="none" stroke="#bcd8e6" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  candle: (
    <>
      {glow(20, 21, "#ffcf6b")}
      <ellipse cx="20" cy="57" rx="12" ry="3" fill="#b88a3a" />
      <rect x="17" y="50" width="6" height="7" fill="#a67a30" />
      <path d="M31 55 a4 4 0 0 0 0 -7" fill="none" stroke="#b88a3a" strokeWidth="2" />
      <rect x="14" y="30" width="12" height="21" rx="1.5" fill="#efe6d2" />
      <path d="M14 33 q2 6 0 9 M26 32 q-1.5 4 0 6" stroke="#e2d6bc" strokeWidth="2" fill="none" />
      <line x1="20" y1="30" x2="20" y2="26.5" stroke="#2a1d14" strokeWidth="1" />
      <path d="M20 17 C23 21 23.5 24 20 27 C16.5 24 17 21 20 17 Z" fill="#ffb43a" />
      <path d="M20 21 C21.3 23 21.3 24.5 20 26 C18.7 24.5 18.7 23 20 21 Z" fill="#fff1b8" />
    </>
  ),
  lightning: (
    <>
      {glow(20, 40, "#ffe36b")}
      <rect x="9" y="22" width="22" height="37" rx="5" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="1.5" />
      <rect x="11" y="16" width="18" height="7" rx="1.5" fill={CORK} />
      <path d="M23 27 L15.5 41 L21 41 L16.5 54 L27 37.5 L21.5 37.5 L26.5 27 Z" fill="#ffe36b" />
      <path d="M12 27 v20" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  hourglass: (
    <>
      <rect x="7" y="9" width="26" height="4" rx="1" fill={WOOD} />
      <rect x="7" y="56" width="26" height="4" rx="1" fill={WOOD} />
      <path d="M9.5 13 V56 M30.5 13 V56" stroke={WOOD} strokeWidth="2" />
      <path d="M12.5 13 h15 c0 10 -5.5 14 -5.5 21.5 c0 7.5 5.5 11.5 5.5 21.5 h-15 c0 -10 5.5 -14 5.5 -21.5 c0 -7.5 -5.5 -11.5 -5.5 -21.5 z" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="1" />
      <path d="M15 24 h10 c-1.5 4 -4 6 -5 9 c-1 -3 -3.5 -5 -5 -9 z" fill="#d8b26a" />
      <path d="M20 34 v16" stroke="#d8b26a" strokeWidth="0.8" />
      <path d="M13.5 56 c1 -4 4 -6 6.5 -6 c2.5 0 5.5 2 6.5 6 z" fill="#d8b26a" />
    </>
  ),
  vials: (
    <>
      {[
        [10, "#aeb9c2"],
        [17.5, "#c47a3a"],
        [25, "#d9c27a"],
      ].map(([x, liquid]) => (
        <g key={x as number}>
          <rect x={x as number} y="30" width="5.5" height="27" rx="2.75" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="0.8" />
          <rect x={(x as number) + 0.8} y="40" width="3.9" height="16" rx="1.9" fill={liquid as string} />
          <rect x={(x as number) + 0.5} y="27" width="4.5" height="4" rx="1" fill={CORK} />
        </g>
      ))}
      <rect x="6" y="46" width="28" height="3" rx="1" fill={WOOD} />
      <rect x="6" y="57" width="28" height="3" rx="1" fill={WOOD} />
      <path d="M7 46 V60 M33 46 V60" stroke={WOOD_DARK} strokeWidth="2" />
    </>
  ),
  sphere: (
    <>
      {glow(20, 40, "#8fd8ff")}
      <ellipse cx="20" cy="58" rx="8" ry="2" fill={WOOD_DARK} />
      <circle cx="20" cy="42" r="14" fill="rgba(200, 235, 255, 0.14)" stroke="#d6eefc" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M20 33 L26.5 41 L20 51 L13.5 41 Z" fill="#7fd0ff" />
      <path d="M20 33 L23 41 L20 51 Z" fill="#b8e7ff" />
      <path d="M11 37 a10 10 0 0 1 6 -6" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" />
    </>
  ),
  sword: (
    <>
      <path d="M4 60 C5 50 10 45 20 45 C30 45 35 50 36 60 Z" fill="#7d7a72" />
      <path d="M9 52 c4 -3 9 -4 14 -3" fill="none" stroke="#9c988e" strokeWidth="1.2" />
      <rect x="18.5" y="20" width="3" height="27" fill="#cfd6dc" />
      <path d="M20 20 v26" stroke="#eef2f4" strokeWidth="0.8" />
      <rect x="12" y="18" width="16" height="3" rx="1" fill={GOLD} />
      <rect x="18.5" y="8" width="3" height="10" fill="#5a3a22" />
      <circle cx="20" cy="7" r="2.6" fill={GOLD} />
    </>
  ),
  rose: (
    <>
      <ellipse cx="20" cy="57" rx="13" ry="3" fill={WOOD} />
      <path d="M20 55 V38" stroke="#4f7a3f" strokeWidth="1.5" />
      <path d="M20 47 q-6 -1 -7 -5 q5 0 7 4 M20 44 q5 -2 7 -6 q-5 1 -7 5" fill="#5f8a4f" />
      <circle cx="20" cy="35" r="5" fill="#a8243a" />
      <path d="M16.5 34 q3.5 -4 7 0 q-3.5 3 -7 0 z" fill="#c9384f" />
      <path d="M9 55 V30 a11 11 0 0 1 22 0 V55" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="1.2" />
      <circle cx="20" cy="17.5" r="2" fill={GLASS_EDGE} />
      <path d="M12 46 V31 a8 8 0 0 1 4 -6" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />
    </>
  ),
  potion: (
    <>
      <path d="M8 45 a12 12 0 0 0 24 0 z" fill="#8e4fb3" />
      <path d="M16 22 h8 v8 c6 3 10 8 10 15 a14 14 0 0 1 -28 0 c0 -7 4 -12 10 -15 z" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="1.2" />
      <rect x="15.5" y="16" width="9" height="7" rx="1.5" fill={CORK} />
      <circle cx="16" cy="50" r="1.2" fill="#d7b4ec" />
      <circle cx="22" cy="53" r="0.9" fill="#d7b4ec" />
      <circle cx="25" cy="48" r="0.7" fill="#d7b4ec" />
      <path d="M10 41 a11 11 0 0 1 5 -6" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" />
    </>
  ),
  crystal: (
    <>
      {glow(20, 36, "#b9a2ff")}
      <path d="M10 60 L13.5 50 H26.5 L30 60 Z" fill={WOOD} />
      <rect x="12" y="48" width="16" height="3" rx="1" fill={GOLD} />
      <circle cx="20" cy="36" r="13" fill="#6d55b0" opacity="0.55" />
      <path d="M13 38 c3 -6 9 -2 13 -7" fill="none" stroke="#d9ccff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 31 a9 9 0 0 1 6 -5" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.4" />
    </>
  ),
  quill: (
    <>
      <path d="M21.5 44 C24 30 28 16 35 3 C29 9 24 19 21.5 33 Z" fill="#efe8da" />
      <path d="M21.5 44 C25 30 29 16 35 3" fill="none" stroke="#b9ac92" strokeWidth="0.8" />
      <rect x="13" y="42" width="14" height="5" rx="1" fill="#2c3a4f" />
      <path d="M10 46 h20 v8 a4 4 0 0 1 -4 4 h-12 a4 4 0 0 1 -4 -4 z" fill="#1f2a3a" />
      <path d="M12.5 49 v6" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  rocket: (
    <>
      <ellipse cx="20" cy="58" rx="9" ry="2" fill={WOOD_DARK} />
      <line x1="20" y1="48" x2="20" y2="57" stroke="#555" strokeWidth="1.5" />
      <path d="M20 5 C27 13 28 26 26 44 H14 C12 26 13 13 20 5 Z" fill="#e2dccf" />
      <path d="M20 5 C23.5 9 25 13 25.6 17 H14.4 C15 13 16.5 9 20 5 Z" fill="#a8482a" />
      <path d="M14 33 L7 47 L14 45 Z M26 33 L33 47 L26 45 Z" fill="#a8482a" />
      <circle cx="20" cy="25" r="3.6" fill="#4c6178" stroke="#b9b2a6" strokeWidth="1.2" />
      <rect x="16" y="44" width="8" height="3.5" rx="1" fill="#6b6b6b" />
    </>
  ),
  globe: (
    <>
      <ellipse cx="20" cy="58" rx="10" ry="2.2" fill={WOOD} />
      <line x1="20" y1="47" x2="20" y2="57" stroke={WOOD_DARK} strokeWidth="2" />
      <path d="M7.5 18 A15 15 0 0 0 32.5 44" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <circle cx="20" cy="31" r="12.5" fill="#3f7086" />
      <path d="M12 26 c3 -3 7 -2 8 1 c1 3 -3 4 -2 7 c1 3 -3 4 -5 2 c-2 -3 -3 -7 -1 -10 z M23 22 c3 0 6 3 6 6 c-2 1 -4 0 -5 -2 c-1 -1 -2 -3 -1 -4 z M24 36 c2 -1 4 0 4 2 c-1 2 -3 3 -5 2 z" fill="#9aa86a" />
      <path d="M12 23 a10 10 0 0 1 5 -3.5" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />
    </>
  ),
  plant: (
    <>
      <ellipse cx="20" cy="30" rx="4" ry="11" fill="#5f8a4f" />
      <ellipse cx="13" cy="34" rx="3.5" ry="9" fill="#6f9a5c" transform="rotate(-32 13 34)" />
      <ellipse cx="27" cy="34" rx="3.5" ry="9" fill="#6f9a5c" transform="rotate(32 27 34)" />
      <ellipse cx="9" cy="40" rx="2.6" ry="6.5" fill="#557d45" transform="rotate(-58 9 40)" />
      <ellipse cx="31" cy="40" rx="2.6" ry="6.5" fill="#557d45" transform="rotate(58 31 40)" />
      <path d="M11 44 h18 l-2.2 16 h-13.6 z" fill="#a8573a" />
      <rect x="10" y="42" width="20" height="4" rx="1" fill="#bf6a45" />
    </>
  ),
};

export function Trinket({ kind, label }: { kind: TrinketKind; label: string }) {
  return (
    <svg className="trinket" viewBox="0 0 40 60" role="img" aria-label={label}>
      <title>{label}</title>
      {DRAWINGS[kind]}
    </svg>
  );
}
