export interface Game {
  id: number;
  title: string;
  genre: string;
  filePath?: string;
  fileName?: string;
  fileData?: string;
  core?: string;
  coverArt?: string;
  autoCoverArt?: string;
  coverArtFit?: 'cover' | 'contain';
  progress?: number;
  isComplete?: boolean;
}

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
  default: {
    highlight: '#a9b7ff', darkBg: '#070a14', midDark: '#121a2d',
    softLight: '#eef4ff', sidebarHover: '#182447',
    gradientFrom: '#60a5fa', gradientTo: '#3b82f6'
  },
  red: {
    highlight: '#ffd1d1', darkBg: '#14070a', midDark: '#2b1218',
    softLight: '#fff1f2', sidebarHover: '#3b1620',
    gradientFrom: '#fb7185', gradientTo: '#e11d48'
  },
  orange: {
    highlight: '#ffe08a', darkBg: '#120a04', midDark: '#2a160a',
    softLight: '#fff7ed', sidebarHover: '#3b1e10',
    gradientFrom: '#fb923c', gradientTo: '#f97316'
  },
  yellow: {
    highlight: '#fff3a3', darkBg: '#0f0d03', midDark: '#221c08',
    softLight: '#fefce8', sidebarHover: '#3b300e',
    gradientFrom: '#fde047', gradientTo: '#f59e0b'
  },
  green: {
    highlight: '#b7ffd0', darkBg: '#04120a', midDark: '#0d2416',
    softLight: '#ecfdf5', sidebarHover: '#123b24',
    gradientFrom: '#34d399', gradientTo: '#10b981'
  },
  teal: {
    highlight: '#98fff0', darkBg: '#031114', midDark: '#0a222a',
    softLight: '#ecfeff', sidebarHover: '#0f3642',
    gradientFrom: '#22d3ee', gradientTo: '#06b6d4'
  },
  indigo: {
    highlight: '#cdd6ff', darkBg: '#060815', midDark: '#10163a',
    softLight: '#eef2ff', sidebarHover: '#1a1f55',
    gradientFrom: '#8b5cf6', gradientTo: '#6366f1'
  },
  purple: {
    highlight: '#e3d7ff', darkBg: '#0d0714', midDark: '#1c1030',
    softLight: '#faf5ff', sidebarHover: '#2e1a52',
    gradientFrom: '#d946ef', gradientTo: '#a855f7'
  },
  pink: {
    highlight: '#ffd1f0', darkBg: '#140614', midDark: '#2b102b',
    softLight: '#fdf2f8', sidebarHover: '#3b1440',
    gradientFrom: '#f472b6', gradientTo: '#db2777'
  },
};

export const getGradientStyle = (from: string, to: string): GradientStyle => ({
  backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
});