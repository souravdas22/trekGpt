import { useMemo } from 'react';
import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenWrapper: React.FC<Props> = ({ children, style }) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
