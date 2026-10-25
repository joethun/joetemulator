import type { ZipDirEntry } from '@/lib/zip';

export interface Game {
  id: number;
  title: string;
  genre: string;
  fileName?: string;
  /** All disc file names for multi-disc games, in playlist order (index 0 === fileName). */
  discNames?: string[];
  core?: string;
  coverArt?: string;
  autoCoverArt?: string;
  coverArtFit?: 'cover' | 'contain';
  progress?: number;
  isComplete?: boolean;
  coverLoading?: boolean;
}

/** A disc entry inside a zip, recorded before extraction: the zip directory
 *  record plus the flattened file name it will be stored under. */
export interface ZipDiscRef extends ZipDirEntry {
  name: string;
}

/** A game awaiting system selection: loose files in playlist order (index 0
 *  is the primary disc and becomes `fileName`), or the disc entries of a
 *  zipped set. Zip entries stay unextracted while the picker is open —
 *  extraction is expensive, so it runs during the upload progress phase after
 *  the user confirms. */
export type PendingFile =
  | { files: File[]; zip?: undefined }
  | { zip: File; discs: ZipDiscRef[]; files?: undefined };

export type ViewType = 'library' | 'themes' | 'settings';

export type ThemeColors = {
  highlight: string;
  darkBg: string;
  midDark: string;
  softLight: string;
  sidebarHover: string;
  gradientFrom: string;
  gradientTo: string;
};

export type GradientStyle = {
  backgroundImage: string;
};

export const THEMES: Record<string, ThemeColors> = {
  red: {
    highlight: '#ffa9aa', darkBg: '#120406', midDark: '#2c050c',
    softLight: '#fff0f0', sidebarHover: '#430510',
    gradientFrom: '#f87171', gradientTo: '#d10013'
  },
  orange: {
    highlight: '#ffc97a', darkBg: '#110700', midDark: '#271400',
    softLight: '#fff7ed', sidebarHover: '#3d2000',
    gradientFrom: '#fb923c', gradientTo: '#d04b00'
  },
  yellow: {
    highlight: '#ffe566', darkBg: '#0f0c00', midDark: '#231a00',
    softLight: '#fefce8', sidebarHover: '#382900',
    gradientFrom: '#fbbf24', gradientTo: '#d97706'
  },
  green: {
    highlight: '#b2ffcd', darkBg: '#04120a', midDark: '#002611',
    softLight: '#ecfdf5', sidebarHover: '#003d20',
    gradientFrom: '#28d498', gradientTo: '#029969'
  },
  teal: {
    highlight: '#7ffff0', darkBg: '#001013', midDark: '#00212c',
    softLight: '#ecfeff', sidebarHover: '#003444',
    gradientFrom: '#06d5bf', gradientTo: '#0293b5'
  },
  blue: {
    highlight: '#93c5fd', darkBg: '#050a16', midDark: '#091938',
    softLight: '#eef4ff', sidebarHover: '#0b2352',
    gradientFrom: '#60a5fa', gradientTo: '#2563eb'
  },
  indigo: {
    highlight: '#c4b5fd', darkBg: '#060612', midDark: '#0f0d2e',
    softLight: '#eef2ff', sidebarHover: '#181548',
    gradientFrom: '#818cf8', gradientTo: '#4f46e5'
  },
  purple: {
    highlight: '#ceb7fe', darkBg: '#0d0714', midDark: '#1c1030',
    softLight: '#faf5ff', sidebarHover: '#2e1a52',
    gradientFrom: '#d946ef', gradientTo: '#8124ca'
  },
  pink: {
    highlight: '#ffb3e6', darkBg: '#130412', midDark: '#280828',
    softLight: '#fdf2f8', sidebarHover: '#3d0d3a',
    gradientFrom: '#f472b6', gradientTo: '#d20064'
  },
};

export const getGradientStyle = ({ gradientFrom, gradientTo }: ThemeColors): GradientStyle => ({
  backgroundImage: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
});