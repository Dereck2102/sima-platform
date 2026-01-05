import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';

import { authService } from '@sima-platform/mobile-core';

export const LoginScreen = () => {
  const [username, setUsername] = useState('admin_sima');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      console.log('Intentando login con:', username);
      const data = await authService.login({ username, password });
      
      Alert.alert('¡Bienvenido!', `Token recibido: ${data.accessToken.substring(0, 10)}...`);
      console.log('Token completo:', data.accessToken);
      
      // AQUÍ PRONTO: Guardaremos el token y navegaremos al Home
      
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Falló el acceso', 'Verifica tus credenciales o que el servidor (Backend) esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>SIMA</Text>
        <Text style={styles.subtitle}>Sistema Integrado de Manejo de Activos</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Ej. admin_sima"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>INGRESAR</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footer}>Powered by BIG SOLUTIONS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A', 
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
    fontSize: 12,
  },
});