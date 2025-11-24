// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function SignUpScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* 🔧 FIX — применяем paddingTop здесь */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <MaterialCommunityIcons name="airplane" size={36} color="#000" />
        </View>

        <Text style={styles.title}>Sign Up for Your Account</Text>
        <Text style={styles.sub}>Complete your info to create your account</Text>

        <View style={{ width: '100%', marginTop: 18 }}>
          <Input label="Name" placeholder="Enter your name" value={name} onChangeText={setName} />
          <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="Confirm Password" placeholder="Enter your confirm password" secureTextEntry />
          <PrimaryButton title="Sign up" onPress={() => { }} />
        </View>

        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#777', fontFamily: 'Roboto_400Regular' }}>
            Already use Let'sfly? <Text style={{ color: '#29A9E0' }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, alignItems: 'center' },

  // 🔧 FIX: убрано insets.top + 10
  header: { alignItems: 'center' },

  title: { fontSize: 20, fontFamily: 'Roboto_700Bold', marginTop: 12, textAlign: 'center' },
  sub: { color: '#9A9A9A', marginTop: 8, textAlign: 'center', fontFamily: 'Roboto_400Regular' },
});