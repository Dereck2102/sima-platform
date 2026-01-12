import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AuthService } from '../services/auth.service';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'SIMA - Assets',
              headerShown: false, // HomeScreen has its own header
            }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F2F2F7',
  },
};
