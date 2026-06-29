import { useMemo } from 'react';
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputField: React.FC<Props> = ({ label, error, leftIcon, rightIcon, style, ...props }) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          {...props}
        />
        {rightIcon}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    marginBottom: normalize(14),
  },
  label: {
    color: '#94A3B8',
    fontSize: normalizeFont(14),
    marginBottom: normalize(8),
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    height: normalize(48),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: normalizeFont(16),
    paddingLeft: normalize(12),
    paddingRight: normalize(8),
    height: '100%',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: normalizeFont(12),
    marginTop: normalize(4),
  },
});
