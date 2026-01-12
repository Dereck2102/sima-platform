import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginDto {
  email: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    tenantId: string;
  };
}

export class AuthService {
  // Use relative URL - Vite proxy handles forwarding to localhost:3000
  private static readonly API_URL = '/api/auth';
  private static readonly TOKEN_KEY = '@sima:accessToken';
  private static readonly REFRESH_TOKEN_KEY = '@sima:refreshToken';
  private static readonly USER_KEY = '@sima:user';

  static async login(credentials: LoginDto): Promise<TokenResponse> {
    console.log('[AuthService] Starting login...', credentials.email);
    
    try {
      const response = await fetch(`${this.API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      console.log('[AuthService] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[AuthService] Login failed:', error);
        throw new Error(error.message || 'Invalid credentials');
      }

      const data: TokenResponse = await response.json();
      console.log('[AuthService] Login successful, storing tokens...');
      
      // Store tokens and user info
      await AsyncStorage.setItem(this.TOKEN_KEY, data.accessToken);
      console.log('[AuthService] Access token stored');
      
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
      console.log('[AuthService] Refresh token stored');
      
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      console.log('[AuthService] User data stored');

      return data;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_KEY,
    ]);
  }

  static async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  static async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static async getCurrentUser() {
    const userJson = await AsyncStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.API_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await this.logout();
        return null;
      }

      const data = await response.json();
      await AsyncStorage.setItem(this.TOKEN_KEY, data.accessToken);
      return data.accessToken;
    } catch (error) {
      await this.logout();
      return null;
    }
  }
}
