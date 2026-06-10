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

import type { ZipDirEntry } from '@/lib/zip';

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
    highlight: '#ffb3b3', darkBg: '#120406', midDark: '#280a0e',
    softLight: '#fff0f0', sidebarHover: '#3d0f14',
    gradientFrom: '#f87171', gradientTo: '#dc2626'
  },
  orange: {
    highlight: '#ffc97a', darkBg: '#110700', midDark: '#271400',
    softLight: '#fff7ed', sidebarHover: '#3d2000',
    gradientFrom: '#fb923c', gradientTo: '#ea580c'
  },
  yellow: {
    highlight: '#ffe566', darkBg: '#0f0c00', midDark: '#231a00',
    softLight: '#fefce8', sidebarHover: '#382900',
    gradientFrom: '#fbbf24', gradientTo: '#d97706'
  },
  green: {
    highlight: '#b7ffd0', darkBg: '#04120a', midDark: '#0d2416',
    softLight: '#ecfdf5', sidebarHover: '#123b24',
    gradientFrom: '#34d399', gradientTo: '#10b981'
  },
  teal: {
    highlight: '#7ffff0', darkBg: '#021012', midDark: '#082028',
    softLight: '#ecfeff', sidebarHover: '#0d3340',
    gradientFrom: '#2dd4bf', gradientTo: '#0891b2'
  },
  blue: {
    highlight: '#a9b7ff', darkBg: '#070a14', midDark: '#121a2d',
    softLight: '#eef4ff', sidebarHover: '#182447',
    gradientFrom: '#60a5fa', gradientTo: '#3b82f6'
  },
  indigo: {
    highlight: '#c4b5fd', darkBg: '#060612', midDark: '#0f0d2e',
    softLight: '#eef2ff', sidebarHover: '#181548',
    gradientFrom: '#818cf8', gradientTo: '#4f46e5'
  },
  purple: {
    highlight: '#e3d7ff', darkBg: '#0d0714', midDark: '#1c1030',
    softLight: '#faf5ff', sidebarHover: '#2e1a52',
    gradientFrom: '#d946ef', gradientTo: '#a855f7'
  },
  pink: {
    highlight: '#ffb3e6', darkBg: '#130412', midDark: '#280828',
    softLight: '#fdf2f8', sidebarHover: '#3d0d3a',
    gradientFrom: '#f472b6', gradientTo: '#be185d'
  },
};

export const getGradientStyle = (from: string, to: string): GradientStyle => ({
  backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
});