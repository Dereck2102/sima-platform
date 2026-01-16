import axios from 'axios';
import { AuthService } from './auth.service';

// Gateway connection - Use relative URL with Vite proxy
const API_URL = '/api';

export interface CreateAssetDto {
  internalCode: string;
  name: string;
  description?: string;
  price: number;
  status: string;
  condition: string;
  locationId?: string;
  acquisitionDate?: string;
}

export interface Asset {
  id: string;
  internalCode: string;
  name: string;
  description?: string;
  status: string;
  condition: string;
  price: number;
  tenantId: string;
  locationId?: string;
  custodianId?: string;
  acquisitionDate?: string;
}

export const AssetService = {
  getAll: async (): Promise<Asset[]> => {
    const token = await AuthService.getAccessToken();
    const response = await axios.get(`${API_URL}/assets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Asset> => {
    const token = await AuthService.getAccessToken();
    const response = await axios.get(`${API_URL}/assets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  create: async (asset: CreateAssetDto): Promise<Asset> => {
    const token = await AuthService.getAccessToken();
    const response = await axios.post(`${API_URL}/assets`, asset, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  update: async (id: string, asset: Partial<CreateAssetDto>): Promise<Asset> => {
    const token = await AuthService.getAccessToken();
    const response = await axios.patch(`${API_URL}/assets/${id}`, asset, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const token = await AuthService.getAccessToken();
    await axios.delete(`${API_URL}/assets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
