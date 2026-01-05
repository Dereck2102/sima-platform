export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
  LOST = 'LOST'
}

export enum AssetCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export interface IAsset {
  id?: string;
  internalCode: string; // Código de barras/QR interno
  name: string;
  description?: string;
  status: AssetStatus;
  condition: AssetCondition;
  acquisitionDate: Date;
  price: number;
  locationId: string; // ID de la ubicación (Facultad/Aula)
  custodianId?: string; // ID de la persona responsable
  createdAt?: Date;
  updatedAt?: Date;
}