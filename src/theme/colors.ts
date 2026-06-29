export const darkColors = {
  background: '#0D1117',
  surface: '#161B22',
  primary: '#22C55E',
  accent: '#84CC16',
  text: '#F8FAFC',
  muted: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  outline: '#21262D',
};

export const lightColors = {
  background: '#E2E8F0', // Softer, darker slate gray for less glare
  surface: '#F1F5F9', // Slightly off-white surface
  primary: '#A3E635', // Lime green
  accent: '#A3E635',
  text: '#0F172A',
  muted: '#475569',
  success: '#10B981',
  error: '#EF4444',
  warning: '#D97706',
  outline: '#CBD5E1',
};

// Kept for backward compatibility
export const colors = darkColors;
export type ColorsType = typeof darkColors;
