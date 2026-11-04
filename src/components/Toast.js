import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

// toast = { id, message, type: 'success' | 'error' } ou null
export default function Toast({ toast, onHide }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return undefined;
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        onHide()
      );
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { opacity }, isError ? styles.error : styles.success]}
    >
      <Text style={[styles.text, { color: isError ? colors.danger : colors.success }]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 96,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  success: { backgroundColor: colors.successBg, borderColor: colors.success },
  error: { backgroundColor: colors.dangerBg, borderColor: colors.danger },
  text: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
