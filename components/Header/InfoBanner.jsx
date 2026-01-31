import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function InfoBanner({ id = 'default', message = '', type = 'info', duration = 0 }) {
  const [visible, setVisible] = useState(false);
  const slide = new Animated.Value(-60);

  useEffect(() => {
    let mounted = true;
    const checkHidden = async () => {
      try {
        const key = `infoBannerHidden:${id}`;
        const val = await AsyncStorage.getItem(key);
        if (!val && mounted) {
          setVisible(true);
          Animated.timing(slide, { toValue: 0, duration: 350, useNativeDriver: true }).start();
          if (duration && duration > 0) {
            setTimeout(() => handleHide(true), duration);
          }
        }
      } catch (e) {
        // ignore
        if (mounted) setVisible(true);
      }
    };
    checkHidden();
    return () => { mounted = false; };
  }, []);

  const handleHide = async (persist = false) => {
    Animated.timing(slide, { toValue: -60, duration: 250, useNativeDriver: true }).start(() => setVisible(false));
    if (persist) {
      try {
        const key = `infoBannerHidden:${id}`;
        await AsyncStorage.setItem(key, '1');
      } catch (e) {
        // ignore
      }
    }
  };

  if (!visible) return null;

  const bg = type === 'warning' ? '#fff4e5' : type === 'success' ? '#e9f7ef' : '#e8f1ff';
  const border = type === 'warning' ? '#ffd89b' : type === 'success' ? '#9be2b8' : '#9fbffb';

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bg, borderColor: border, transform: [{ translateY: slide }] }]}>
      <View style={styles.messageWrap}>
        <Text numberOfLines={2} style={styles.messageText}>{message}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleHide(true)} style={styles.actionBtn} accessibilityLabel="Dismiss update">
          <Ionicons name="close" size={18} color="#333" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    marginHorizontal: 6,
    borderWidth: 1,
  },
  messageWrap: { flex: 1 },
  messageText: { color: '#222', fontSize: 13, fontWeight: '600' },
  actions: { marginLeft: 8 },
  actionBtn: { padding: 6 },
});
