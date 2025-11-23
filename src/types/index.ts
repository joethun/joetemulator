export interface Game {
  id: number;
  title: string;
  genre: string;
  filePath?: string;
  fileName?: string;
  fileData?: string; // legacy support
  core?: string;
  coverArt?: string;
  coverArtFit?: 'cover' | 'contain';
  progress?: number; // upload progress (0-100)
  isComplete?: boolean; // trigger completion animation
}

type ThemeColors = {
  highlight: string;
  darkBg: string;
  midDark: string;
  softLight: string;
  sidebarHover: string;
  play: string;
  gradientFrom: string;
  gradientTo: string;
};

// themes configuration
export const THEMES: Record<string, ThemeColors> = {
  default: {
    highlight: '#8899cc', darkBg: '#0a0a0f', midDark: '#151520',
    softLight: '#e8eef5', sidebarHover: '#1f2535', play: '#4a90e2',
    gradientFrom: '#4a90e2', gradientTo: '#2563eb'
  },
  red: {
    highlight: '#fecaca', darkBg: '#0f0a0a', midDark: '#201515',
    softLight: '#fef2f2', sidebarHover: '#351f1f', play: '#f87171',
    gradientFrom: '#f87171', gradientTo: '#ef4444'
  },
  orange: {
    highlight: '#fde68a', darkBg: '#0f0c05', midDark: '#201810',
    softLight: '#fffbeb', sidebarHover: '#352a1f', play: '#fbbf24',
    gradientFrom: '#fbbf24', gradientTo: '#f59e0b'
  },
  yellow: {
    highlight: '#fef08a', darkBg: '#0f0e05', midDark: '#201e10',
    softLight: '#fefce8', sidebarHover: '#35321f', play: '#eab308',
    gradientFrom: '#eab308', gradientTo: '#ca8a04'
  },
  green: {
    highlight: '#bbf7d0', darkBg: '#050f05', midDark: '#102010',
    softLight: '#f0fdf4', sidebarHover: '#1f351f', play: '#4ade80',
    gradientFrom: '#4ade80', gradientTo: '#22c55e'
  },
  teal: {
    highlight: '#99f6e4', darkBg: '#050f0f', midDark: '#102020',
    softLight: '#f0fdfa', sidebarHover: '#1f3535', play: '#2dd4bf',
    gradientFrom: '#2dd4bf', gradientTo: '#14b8a6'
  },
  indigo: {
    highlight: '#c7d2fe', darkBg: '#0a0a0f', midDark: '#151525',
    softLight: '#eef2ff', sidebarHover: '#1f1f35', play: '#818cf8',
    gradientFrom: '#818cf8', gradientTo: '#6366f1'
  },
  purple: {
    highlight: '#ddd6fe', darkBg: '#0e0a0f', midDark: '#1d1520',
    softLight: '#faf5ff', sidebarHover: '#2a1f35', play: '#c084fc',
    gradientFrom: '#c084fc', gradientTo: '#a855f7'
  },
  pink: {
    highlight: '#fbcfe8', darkBg: '#0f0a0d', midDark: '#20151c',
    softLight: '#fdf2f8', sidebarHover: '#351f2a', play: '#ec4899',
    gradientFrom: '#ec4899', gradientTo: '#be185d'
  },
};

export type ThemeConfig = ThemeColors;

// css gradient helper
export const getGradientStyle = (from: string, to: string) => ({
  backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
});