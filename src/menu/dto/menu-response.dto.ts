export class ModifierItemDto {
  id: number;
  name: string;
  price: number;
  perItemMax?: number;
}

export class ModifierGroupDto {
  id: number;
  name: string;
  publicName?: string;
  logic: 'SUM' | 'MAX';
  minQty?: number;
  maxQty?: number;
  items: ModifierItemDto[];
}

export class ProductDto {
  id: number;
  externalId: string;
  code?: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  isActive: boolean;
  isFavorite: boolean;
  imageUrl?: string;
  modifiers: ModifierGroupDto[];
}

export class MenuCategoryDto {
  category: string;
  subcategory?: string;
  products: ProductDto[];
}

