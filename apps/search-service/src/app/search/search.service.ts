import { Injectable, Logger } from '@nestjs/common';
import { SearchAssetsDto, SearchResult } from './search.dto';

// Simulated asset data for demonstration
// In production, this would connect to the Inventory Service database or Elasticsearch
interface Asset {
  id: string;
  tenantId: string;
  internalCode: string;
  name: string;
  description: string;
  status: string;
  condition: string;
  price: number;
  locationId: string;
  custodianId?: string;
  createdAt: Date;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  // Demo data - in production would query shared database or Elasticsearch
  private readonly demoAssets: Asset[] = [
    {
      id: '1',
      tenantId: 'uce-001',
      internalCode: 'LAPTOP-001',
      name: 'Dell Latitude 7490',
      description: 'Laptop empresarial de alto rendimiento',
      status: 'ACTIVE',
      condition: 'GOOD',
      price: 1500,
      locationId: 'lab-101',
      custodianId: 'user-001',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      tenantId: 'uce-001',
      internalCode: 'MONITOR-001',
      name: 'Dell UltraSharp 27"',
      description: 'Monitor 4K profesional',
      status: 'ACTIVE',
      condition: 'NEW',
      price: 800,
      locationId: 'lab-101',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: '3',
      tenantId: 'uce-001',
      internalCode: 'DESK-001',
      name: 'Escritorio Ergonómico',
      description: 'Escritorio ajustable en altura',
      status: 'ACTIVE',
      condition: 'GOOD',
      price: 450,
      locationId: 'office-201',
      custodianId: 'user-002',
      createdAt: new Date('2024-03-10'),
    },
    {
      id: '4',
      tenantId: 'uce-002',
      internalCode: 'PRINTER-001',
      name: 'HP LaserJet Pro',
      description: 'Impresora láser multifunción',
      status: 'MAINTENANCE',
      condition: 'FAIR',
      price: 350,
      locationId: 'admin-301',
      createdAt: new Date('2023-06-15'),
    },
  ];

  async searchAssets(searchDto: SearchAssetsDto, tenantId: string): Promise<SearchResult<Asset>> {
    this.logger.log(`Searching assets for tenant: ${tenantId} with query: ${JSON.stringify(searchDto)}`);

    let filtered = this.demoAssets.filter(asset => asset.tenantId === tenantId);

    // Text search
    if (searchDto.query) {
      const query = searchDto.query.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        asset.description.toLowerCase().includes(query) ||
        asset.internalCode.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (searchDto.status) {
      filtered = filtered.filter(asset => asset.status === searchDto.status);
    }

    // Condition filter
    if (searchDto.condition) {
      filtered = filtered.filter(asset => asset.condition === searchDto.condition);
    }

    // Location filter
    if (searchDto.locationId) {
      filtered = filtered.filter(asset => asset.locationId === searchDto.locationId);
    }

    // Custodian filter
    if (searchDto.custodianId) {
      filtered = filtered.filter(asset => asset.custodianId === searchDto.custodianId);
    }

    // Price range
    if (searchDto.minPrice !== undefined) {
      filtered = filtered.filter(asset => asset.price >= searchDto.minPrice!);
    }
    if (searchDto.maxPrice !== undefined) {
      filtered = filtered.filter(asset => asset.price <= searchDto.maxPrice!);
    }

    // Sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof Asset];
      const bVal = b[sortBy as keyof Asset];
      if (aVal < bVal) return sortOrder === 'ASC' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

    // Pagination
    const total = filtered.length;
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 20;
    const start = (page - 1) * limit;
    const paginatedData = filtered.slice(start, start + limit);

    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getSuggestions(query: string, tenantId: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const assets = this.demoAssets.filter(asset => asset.tenantId === tenantId);
    const queryLower = query.toLowerCase();

    const suggestions = new Set<string>();
    assets.forEach(asset => {
      if (asset.name.toLowerCase().includes(queryLower)) {
        suggestions.add(asset.name);
      }
      if (asset.internalCode.toLowerCase().includes(queryLower)) {
        suggestions.add(asset.internalCode);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }
}
