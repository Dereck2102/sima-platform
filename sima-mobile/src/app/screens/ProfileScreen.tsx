import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthService } from '../services/auth.service';

export const ProfileScreen = ({ navigation }: any) => {
  const handleLogout = async () => {
    await AuthService.logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>Manage your account settings</Text>
      
      <View style={styles.card}>
        <Text style={styles.info}>👤 User: dsamacoria@uce.edu.ec</Text>
        <Text style={styles.info}>🏢 Tenant: UCE</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '100%', marginBottom: 20, elevation: 2 },
  info: { fontSize: 16, marginBottom: 10, color: '#444' },
  logoutBtn: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 10 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  backBtn: { padding: 15 },
  backText: { color: '#007AFF', fontSize: 16 },
});
