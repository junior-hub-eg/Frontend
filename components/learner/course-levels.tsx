import type { ComponentType } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  Box,
  Braces,
  Brain,
  Bug,
  CheckCircle2,
  ClipboardList,
  Code2,
  Database,
  FileCode2,
  Gamepad2,
  LayoutGrid,
  LayoutTemplate,
  Lock,
  MousePointer2,
  Palette,
  PenTool,
  PlayCircle,
  Rocket,
  Search,
  Server,
  Shield,
  SkipForward,
  Smartphone,
  Store,
  Table,
  Triangle,
  Wind,
  Zap,
} from "lucide-react";
import { LEVEL_NUMBER, type CourseLevel, type CourseStatus, type LevelStatus } from "@/lib/learning-api";

type Icon = ComponentType<{ className?: string; style?: React.CSSProperties }>;

/** The course's IconKey from learning.json. */
const ICONS: Record<string, Icon> = {
  html: FileCode2,
  css: Palette,
  javascript: Braces,
  bootstrap: LayoutGrid,
  tailwind: Wind,
  react: Atom,
  angular: Triangle,
  nextjs: Zap,
  csharp: Code2,
  database: Database,
  api: Server,
  shield: Shield,
  rocket: Rocket,
  smartphone: Smartphone,
  flutter: Smartphone,
  store: Store,
  palette: Palette,
  search: Search,
  layout: LayoutTemplate,
  figma: PenTool,
  pointer: MousePointer2,
  python: Code2,
  table: Table,
  brain: Brain,
  chart: BarChart3,
  bug: Bug,
  clipboard: ClipboardList,
  code: Code2,
  gamepad: Gamepad2,
  cube: Box,
};

export function CourseIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const Icon = ICONS[iconKey] ?? BookOpen;
  return <Icon className={className} />;
}

export const LEVEL_STYLE: Record<LevelStatus, { label: string; bg: string; text: string; icon: Icon }> = {
  Open: { label: "Open", bg: "#e7f6f3", text: "#12939b", icon: PlayCircle },
  Done: { label: "Done", bg: "#e6f5ec", text: "#2a9a5f", icon: CheckCircle2 },
  Skipped: { label: "Skipped", bg: "#eef2f6", text: "#14365a99", icon: SkipForward },
  Locked: { label: "Locked", bg: "#f3f5f8", text: "#14365a66", icon: Lock },
};

export const COURSE_STYLE: Record<CourseStatus, { label: string; bg: string; text: string }> = {
  Open: { label: "In progress", bg: "#e7f6f3", text: "#12939b" },
  Done: { label: "Completed", bg: "#e6f5ec", text: "#2a9a5f" },
  Locked: { label: "Locked", bg: "#f3f5f8", text: "#14365a80" },
};

/** "Level 1 · Beginner". */
export const levelName = (l: CourseLevel) => `Level ${LEVEL_NUMBER[l.level]} · ${l.level}`;

/** Levels Done or Skipped, out of 3. */
export const levelsDone = (levels: CourseLevel[]) => levels.filter((l) => l.status === "Done" || l.status === "Skipped").length;

/** A small chip per level: Level 1 ✓, Level 2 ▶, Level 3 🔒. */
export function LevelChips({ levels }: { levels: CourseLevel[] }) {
  return (
    <ul className="flex flex-wrap gap-[0.4em]">
      {levels.map((l) => {
        const style = LEVEL_STYLE[l.status];
        return (
          <li
            key={l.level}
            title={`${levelName(l)}: ${style.label}`}
            className="flex items-center gap-[0.3em] rounded-full px-[0.7em] py-[0.2em] text-[0.68em] font-semibold"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            <style.icon className="size-[1.1em]" /> Level {LEVEL_NUMBER[l.level]}
          </li>
        );
      })}
    </ul>
  );
}
