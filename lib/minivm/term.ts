import { Translations } from "../translated";

interface TermSectionText {
  type: "text";
  content: string | Translations;
  class?: "normal" | "err";
  alignment?: number;
}

interface TermSectionImage {
  type: "image";
  src: string;
  width: number;
  height: number;
}

interface TermSectionGroup {
  type: "group";
  children: TermSection[];
}

type RawTermSection = TermSectionText | TermSectionImage | TermSectionGroup;

// Metadata classes
interface Clickable {
  commandOnClick: string
}

type Metadata = Clickable

export type TermSection = RawTermSection & Partial<Metadata>

export type TermLine = TermSection[];
