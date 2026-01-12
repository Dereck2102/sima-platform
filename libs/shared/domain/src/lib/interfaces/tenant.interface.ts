export interface ITenant {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
