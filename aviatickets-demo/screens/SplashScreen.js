// screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Login');
    }, 1400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <MaterialCommunityIcons name="airplane" size={56} color="#fff" />

        {/* FIX: перенес paddingTop сюда */}
        <Text style={[styles.logoText, { paddingTop: insets.top + 10 }]}>
          Let'sFly
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#29A9E0', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  logoWrap: { 
    alignItems: 'center' 
  },

  // FIX: убран paddingTop отсюда
  logoText: { 
    color: '#fff', 
    fontSize: 22, 
    fontFamily: 'Roboto_700Bold' 
  },
});