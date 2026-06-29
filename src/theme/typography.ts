import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
};
