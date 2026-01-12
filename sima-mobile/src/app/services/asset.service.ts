import axios from 'axios';
import { AuthService } from './auth.service';

// Gateway connection - Use network IP for mobile testing
const API_URL = 'http://192.168.0.168:3000/api';

export const AssetService = {
  getAll: async (): Promise<any[]> => {
    const token = await AuthService.getAccessToken();
    const response = await axios.get(`${API_URL}/assets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  create: async (asset: any): Promise<any> => {
    const token = await AuthService.getAccessToken();
    const response = await axios.post(`${API_URL}/assets`, asset, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }
};
