import {
  Atom,
  Backpack,
  BookOpen,
  Bot,
  Brain,
  Cake,
  Camera,
  Castle,
  Cat,
  Coffee,
  Compass,
  Crown,
  Drama,
  Eye,
  Feather,
  Fingerprint,
  Flame,
  Flower2,
  Footprints,
  Gem,
  Ghost,
  Glasses,
  Globe,
  Headphones,
  Heart,
  Hourglass,
  KeyRound,
  Landmark,
  Leaf,
  Lightbulb,
  Mail,
  Map as MapIcon,
  MessageCircle,
  Microscope,
  Moon,
  MoonStar,
  Music,
  Orbit,
  PartyPopper,
  PenTool,
  Quote,
  Rabbit,
  Rocket,
  Satellite,
  ScrollText,
  Search,
  Skull,
  Smartphone,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Swords,
  Target,
  Telescope,
  WandSparkles,
  Wine,
  Zap,
  Icon as LucideIcon,
  type IconNode,
  type LucideProps,
} from "lucide-react";
import { bat, cauldron, flowerRose, owl, ufo, unicornHead } from "@lucide/lab";
import type { ComponentType } from "react";
import { hash } from "@/lib/palette";

type Icon = ComponentType<LucideProps>;

const line = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Dragon from Tabler Icons (MIT License, Copyright (c) 2020-2024 Paweł Kuna),
// drawn in the same 24×24 line style as Lucide.
function Dragon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} {...line} {...props}>
      <path d="M10.706 8.849l-5.706 -3.301l-2 6.452l3.5 -1.973l.5 2.973l3.555 -1.385" />
      <path d="M15 9c0 3.5 4 3 4 7c0 3 -3 5 -5.5 5s-6 -.5 -6.5 -5c2 2 6.592 3.043 7.5 1c1.094 -2.461 -4 -3.459 -4 -6.5c0 -2.062 .5 -2.5 1.8 -3.2" />
      <path d="M18 6a3 3 270 1 0 -3 3h5l1 -3h-3" />
      <path d="M15 3h-8l5 3" />
    </svg>
  );
}

// A single feathered wing (no icon set has one).
function Wing({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} {...line} {...props}>
      <path d="M3 17C5 10 11 5 21 3.5c-.8 3.4-2.4 5.9-4.6 7.5 .9.9.7 2.2-.4 3-1.3.9-2.8 1.2-4.3 1 .2 1.1-.5 2.1-1.7 2.5C7.8 18.2 5.2 17.9 3 17z" />
      <path d="M8.6 11.4c2.4.6 4.9.3 7.2-.6M7.6 14.6c1.8.4 3.6.4 5.3-.1" />
    </svg>
  );
}

// Extra drawings from Lucide Lab (ISC License).
const lab = (node: IconNode): Icon =>
  function LabIcon(props: LucideProps) {
    return <LucideIcon iconNode={node} {...props} />;
  };
const Unicorn = lab(unicornHead);
const Cauldron = lab(cauldron);
const Owl = lab(owl);
const Bat = lab(bat);
const Ufo = lab(ufo);
const Rose = lab(flowerRose);

export type GenreTheme = { key: string; tint: string; icons: Icon[] };

// Matched against the genre name, lowercased; first match wins.
const THEMES: [RegExp, GenreTheme][] = [
  [/fantasy|fairy|myth/, { key: "fantasy", tint: "#e2bf6a", icons: [Dragon, Wing, Unicorn, Castle, WandSparkles, Cauldron, Crown, Gem, Swords, Owl, Dragon, Wing] }],
  [/romance|love/, { key: "romance", tint: "#f0a3b1", icons: [Heart, Coffee, Rose, Mail, Wine, Flower2, Heart, Sparkles, Cake] }],
  [/science fiction|sci-?fi|dystop|space/, { key: "scifi", tint: "#8fd3e8", icons: [Rocket, Orbit, Ufo, Satellite, Atom, Bot, Telescope, Star] }],
  [/mystery|thriller|crime|detective|suspense/, { key: "mystery", tint: "#d9b277", icons: [Search, Fingerprint, KeyRound, Footprints, Glasses, Eye, MoonStar] }],
  [/horror|gothic|ghost/, { key: "horror", tint: "#a8d5a2", icons: [Ghost, Skull, Bat, Moon, Cauldron, Flame, Eye] }],
  [/young adult|\bya\b|teen/, { key: "ya", tint: "#c9b2f0", icons: [Backpack, Headphones, Smartphone, Music, Star, Sparkles, Heart] }],
  [/histor/, { key: "history", tint: "#d8c08e", icons: [Landmark, ScrollText, Hourglass, Crown, MapIcon, Feather] }],
  [/memoir|biograph/, { key: "memoir", tint: "#e4c3a2", icons: [Camera, Quote, Footprints, MapIcon, Coffee, PenTool] }],
  [/self-?help|psych|business|productiv/, { key: "selfhelp", tint: "#f2d17a", icons: [Lightbulb, Sun, Brain, Target, Sprout, Sparkles] }],
  [/science|nonfiction|non-fiction|travel|nature/, { key: "nonfiction", tint: "#a9cfc2", icons: [Lightbulb, Microscope, Globe, Compass, Brain, Leaf] }],
  [/classic|poetry|literary|fiction/, { key: "literary", tint: "#e6d3a8", icons: [Feather, PenTool, Quote, Drama, BookOpen, Coffee, Owl, Leaf] }],
  [/graphic|comic|manga/, { key: "graphic", tint: "#f2b36d", icons: [Zap, MessageCircle, Star, Sparkles, PartyPopper] }],
  [/child|kids|picture/, { key: "children", tint: "#f5c58a", icons: [Rabbit, Cat, Sun, Star, PartyPopper, Cake] }],
];

const BOOKISH: GenreTheme = { key: "bookish", tint: "#e6d3a8", icons: [BookOpen, Feather, Star, Coffee, Leaf, MoonStar] };

export function genreTheme(genre: string | null | undefined): GenreTheme {
  const g = genre?.toLowerCase() ?? "";
  return (g && THEMES.find(([re]) => re.test(g))?.[1]) || BOOKISH;
}

// The genre most books on a shelf share, if it's a clear majority.
export function shelfGenre(books: { genre: string | null }[]) {
  const counts = new Map<string, number>();
  for (const b of books) if (b.genre) counts.set(b.genre, (counts.get(b.genre) ?? 0) + 1);
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return top && top[1] / books.length >= 0.4 ? top[0] : null;
}

export function GenreIcon({ genre, className }: { genre: string | null; className?: string }) {
  const theme = genreTheme(genre);
  const Icon = theme.icons[0];
  return <Icon className={className ?? "inline-icon"} aria-hidden />;
}

// A scatter of faint doodles. Positions are deterministic (seeded), so the
// wallpaper doesn't reshuffle on every visit.
// One doodle per grid cell (jittered), so they spread evenly and never pile up.
export function MotifField({
  genre,
  seed,
  rows = 3,
  cols = 8,
  as: Tag = "div",
  className = "motif-field",
}: {
  genre: string | null;
  seed: string;
  rows?: number;
  cols?: number;
  as?: "div" | "li";
  className?: string;
}) {
  const theme = genreTheme(genre);
  const count = rows * cols;
  return (
    <Tag className={`${className} motif-${theme.key}`} aria-hidden style={{ "--motif": theme.tint } as React.CSSProperties}>
      {Array.from({ length: count }, (_, i) => {
        const h = hash(`${seed}:${i}`);
        const Icon = theme.icons[h % theme.icons.length];
        const left = ((i % cols) + 0.25 + ((h >>> 3) % 50) / 100) * (100 / cols);
        const top = (Math.floor(i / cols) + 0.25 + ((h >>> 9) % 50) / 100) * (100 / rows);
        const size = 24 + ((h >>> 5) % 5) * 6;
        const rotate = ((h >>> 12) % 50) - 25;
        return (
          <span
            key={i}
            className={(h >>> 15) % 4 === 0 ? "motif drift" : "motif"}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              rotate: `${rotate}deg`,
              animationDelay: `${-((h >>> 18) % 12)}s`,
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </span>
        );
      })}
    </Tag>
  );
}
