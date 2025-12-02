// components/LoadingOverlay.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export default function LoadingOverlay() {
  return (
    <BlurView intensity={80} tint="light" style={styles.wrap}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color="#29A9E0" />
        <Text style={{ marginTop:12, textAlign: 'center' }}>Поиск рейсов…</Text>
        <Text style={{ marginTop:4, fontSize: 12, color: '#666', textAlign: 'center' }}>
          Может занять до 2-3 минут
        </Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressBar, { width: '45%' }]} />
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap:{ ...StyleSheet.absoluteFillObject, alignItems:'center', justifyContent:'center' },
  box:{ width:260, height:150, backgroundColor:'rgba(255,255,255,0.85)', borderRadius:12, alignItems:'center', justifyContent:'center' },
  progressBg:{ marginTop:12, width:'80%', height:8, backgroundColor:'#eee', borderRadius:8 },
  progressBar:{ height:'100%', backgroundColor:'#29A9E0', borderRadius:8 }
});