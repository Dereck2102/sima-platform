import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const PlaceholderScreen = ({ route, navigation }: any) => {
  const { title } = route.params || { title: 'Feature' };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚧</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This feature is coming soon!</Text>
      
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  backBtn: { backgroundColor: '#E5E5EA', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  backText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
});
