import type { LucideProps } from "lucide-react";
import {
  BookOpen,
  GraduationCap,
  Library,
  School,
  NotebookPen,
  PenLine,
  Calculator,
  FlaskConical,
  Microscope,
  Globe,
  Map,
  Compass,
  Lightbulb,
  Brain,
  Atom,
  BookMarked,
  Laptop,
  Presentation,
  ClipboardList,
  PencilRuler,
  TestTube,
  Landmark,
  BookText,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

export const CLASS_ICON_IDS = [
  "book-open",
  "graduation-cap",
  "library",
  "school",
  "notebook-pen",
  "pen-line",
  "calculator",
  "flask-conical",
  "microscope",
  "globe",
  "map",
  "compass",
  "lightbulb",
  "brain",
  "atom",
  "book-marked",
  "laptop",
  "presentation",
  "clipboard-list",
  "pencil-ruler",
  "test-tube",
  "landmark",
  "book-text",
  "sparkles",
] as const;

export type ClassIconId = (typeof CLASS_ICON_IDS)[number];

export const DEFAULT_CLASS_ICON_ID: ClassIconId = "book-open";
export const DEFAULT_CLASS_COLOR_HEX = "#3B82F6";

export const CLASS_ICON_MAP: Record<ClassIconId, ComponentType<LucideProps>> = {
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  library: Library,
  school: School,
  "notebook-pen": NotebookPen,
  "pen-line": PenLine,
  calculator: Calculator,
  "flask-conical": FlaskConical,
  microscope: Microscope,
  globe: Globe,
  map: Map,
  compass: Compass,
  lightbulb: Lightbulb,
  brain: Brain,
  atom: Atom,
  "book-marked": BookMarked,
  laptop: Laptop,
  presentation: Presentation,
  "clipboard-list": ClipboardList,
  "pencil-ruler": PencilRuler,
  "test-tube": TestTube,
  landmark: Landmark,
  "book-text": BookText,
  sparkles: Sparkles,
};

export function getClassIcon(iconId: string | null | undefined): ComponentType<LucideProps> | null {
  if (!iconId || !CLASS_ICON_IDS.includes(iconId as ClassIconId)) return CLASS_ICON_MAP[DEFAULT_CLASS_ICON_ID];
  return CLASS_ICON_MAP[iconId as ClassIconId];
}
