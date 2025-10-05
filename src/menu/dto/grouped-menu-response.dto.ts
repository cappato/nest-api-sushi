/**
 * DTOs para el endpoint /menu/grouped
 * Estructura jerárquica: categories → groups → variants
 */

export class ProductVariantDto {
  id: number;
  pieces: number;
  price: number;
  priceFormatted?: string;
}

export class ProductGroupDto {
  baseName: string;
  imageUrl?: string;
  description?: string;
  modifiersCount: number;
  variants: ProductVariantDto[];
}

export class GroupedCategoryDto {
  name: string;
  groups: ProductGroupDto[];
}

export class GroupedMenuResponseDto {
  categories: GroupedCategoryDto[];
}

