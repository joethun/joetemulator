export interface Game {
  id: number;
  title: string;
  genre: string;
  filePath?: string;
  fileName?: string;
  fileData?: string;
  core?: string;
  coverArt?: string;
  coverArtFit?: 'cover' | 'contain';
}

type ThemeColors = {
  highlight: string;
  darkBg: string;
  midDark: string;
  softLight: string;
  sidebarHover: string;
  playGreen: string;
  gradientFrom: string;
  gradientTo: string;
};

export const THEMES: Record<string, ThemeColors> = {
  default: { highlight: '#8899cc', darkBg: '#0a0a0f', midDark: '#151520', softLight: '#e8eef5', sidebarHover: '#1f2535', playGreen: '#4a90e2', gradientFrom: '#4a90e2', gradientTo: '#2563eb' },
  red: { highlight: '#fecaca', darkBg: '#1f0a0a', midDark: '#2e1414', softLight: '#fef2f2', sidebarHover: '#3d1f1f', playGreen: '#f87171', gradientFrom: '#f87171', gradientTo: '#ef4444' },
  orange: { highlight: '#fde68a', darkBg: '#1f1206', midDark: '#2e1a0a', softLight: '#fffbeb', sidebarHover: '#3d2814', playGreen: '#fbbf24', gradientFrom: '#fbbf24', gradientTo: '#f59e0b' },
  yellow: { highlight: '#fef08a', darkBg: '#1f1a0a', midDark: '#2e2814', softLight: '#fefce8', sidebarHover: '#3d3d1f', playGreen: '#eab308', gradientFrom: '#eab308', gradientTo: '#ca8a04' },
  green: { highlight: '#bbf7d0', darkBg: '#0f1a0f', midDark: '#1e2e1e', softLight: '#f0fdf4', sidebarHover: '#2d3e2d', playGreen: '#4ade80', gradientFrom: '#4ade80', gradientTo: '#22c55e' },
  teal: { highlight: '#99f6e4', darkBg: '#0a1a1a', midDark: '#142a2a', softLight: '#f0fdfa', sidebarHover: '#1f3d3d', playGreen: '#2dd4bf', gradientFrom: '#2dd4bf', gradientTo: '#14b8a6' },
  blue: { highlight: '#bfdbfe', darkBg: '#0c1220', midDark: '#1e293b', softLight: '#eff6ff', sidebarHover: '#334155', playGreen: '#60a5fa', gradientFrom: '#60a5fa', gradientTo: '#3b82f6' },
  indigo: { highlight: '#c7d2fe', darkBg: '#0f0f1f', midDark: '#1e1e2e', softLight: '#eef2ff', sidebarHover: '#2d2d3e', playGreen: '#818cf8', gradientFrom: '#818cf8', gradientTo: '#6366f1' },
  purple: { highlight: '#ddd6fe', darkBg: '#1a0f2e', midDark: '#2d1b3d', softLight: '#faf5ff', sidebarHover: '#3f2d52', playGreen: '#c084fc', gradientFrom: '#c084fc', gradientTo: '#a855f7' },
};

export type ThemeConfig = ThemeColors;
export const getGradientStyle = (from: string, to: string) => ({ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` });
