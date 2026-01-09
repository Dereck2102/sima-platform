import axios from 'axios';

// Gateway connection
const API_URL = 'http://localhost:3000/api';

export const AssetService = {
  getAll: async (): Promise<any[]> => {
    const response = await axios.get(`${API_URL}/assets`);
    return response.data;
  },

  create: async (asset: any): Promise<any> => {
    const response = await axios.post(`${API_URL}/assets`, asset);
    return response.data;
  }
};
