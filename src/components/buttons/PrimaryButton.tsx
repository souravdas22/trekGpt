import { useMemo } from 'react';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.title, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(24),
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    backgroundColor: colors.muted,
  },
  title: {
    color: colors.text,
    fontSize: normalizeFont(16),
    fontWeight: '600',
  },
});
