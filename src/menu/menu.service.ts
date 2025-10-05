import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuCategoryDto, ProductDto, ModifierGroupDto, ModifierItemDto } from './dto/menu-response.dto';
import { GroupedMenuResponseDto, GroupedCategoryDto, ProductGroupDto, ProductVariantDto } from './dto/grouped-menu-response.dto';
import { MENU_CONFIG } from './menu.config';
import { sortCategoriesByPriority } from './menu-order.util';

export interface MenuOptions {
  excludeCategories?: string[];
  groupBySubcategory?: boolean;
}

@Injectable()
export class MenuService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMenu(options: MenuOptions = {}): Promise<MenuCategoryDto[]> {
    const {
      excludeCategories = MENU_CONFIG.DEFAULT_EXCLUDED_CATEGORIES,
      groupBySubcategory = MENU_CONFIG.DEFAULTS.groupBySubcategory,
    } = options;
    // Construir el where clause dinámicamente
    const whereClause: any = {
      isActive: true,
      price: {
        gt: 0
      }
    };

    // Excluir categorías si se especificaron
    if (excludeCategories.length > 0) {
      whereClause.category = {
        name: {
          notIn: excludeCategories
        }
      };
    }

    // Obtener todos los productos activos con precio mayor a 0
    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        subcategory: true,
        image: true,
        modifierGroups: {
          include: {
            group: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { category: { name: 'asc' } },
        { subcategory: { name: 'asc' } },
        { sortWeight: 'asc' },
        { name: 'asc' },
      ],
    });

    // Agrupar productos por categoría y opcionalmente por subcategoría
    const menuMap = new Map<string, MenuCategoryDto>();

    for (const product of products) {
      const categoryName = product.category?.name || 'Sin categoría';
      const subcategoryName = product.subcategory?.name;

      // Determinar la clave de agrupación según la opción
      const key = groupBySubcategory && subcategoryName
        ? `${categoryName}::${subcategoryName}`
        : categoryName;

      if (!menuMap.has(key)) {
        menuMap.set(key, {
          category: categoryName,
          subcategory: groupBySubcategory ? (subcategoryName || undefined) : undefined,
          products: [],
        });
      }

      const menuCategory = menuMap.get(key)!;

      // Mapear modificadores
      const modifiers: ModifierGroupDto[] = product.modifierGroups.map((pmg) => ({
        id: pmg.group.id,
        name: pmg.group.name,
        publicName: pmg.group.publicName || undefined,
        logic: pmg.group.logic,
        minQty: pmg.group.minQty || undefined,
        maxQty: pmg.group.maxQty || undefined,
        items: pmg.group.items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: Number(item.price),
          perItemMax: item.perItemMax || undefined,
        })),
      }));

      menuCategory.products.push({
        id: product.id,
        externalId: product.externalId.toString(),
        code: product.code || undefined,
        name: product.name,
        description: product.description || undefined,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : undefined,
        isActive: product.isActive,
        isFavorite: product.isFavorite,
        imageUrl: product.image?.imageUrl || undefined,
        modifiers,
      });
    }

    // Convertir el map en array y ordenar según prioridad
    const menuArray = Array.from(menuMap.values());
    return sortCategoriesByPriority(menuArray);
  }

  /**
   * Normaliza el nombre de un producto para agrupación
   * Elimina asteriscos iniciales, espacios dobles, y corrige typos comunes
   */
  private normalizeProductName(name: string): string {
    let normalized = name
      // Eliminar asterisco inicial
      .replace(/^\*+/, '')
      // Corregir typos comunes
      .replace(/AHUMADOO/gi, 'AHUMADO')
      .replace(/ROLL\s+ROLL/gi, 'ROLL')
      // Normalizar espacios antes de paréntesis
      .replace(/\s+\(/g, ' (')
      // Trim inicial
      .trim();

    // Eliminar espacios dobles o más (después de otras normalizaciones)
    while (normalized.includes('  ')) {
      normalized = normalized.replace(/\s{2,}/g, ' ');
    }

    return normalized.trim();
  }

  /**
   * Obtiene el menú agrupado por nombre base de producto
   * Agrupa productos con el mismo nombre base pero diferentes cantidades (ej: *12P, *15P, etc.)
   */
  async getGroupedMenu(options: MenuOptions = {}): Promise<GroupedMenuResponseDto> {
    const {
      excludeCategories = MENU_CONFIG.DEFAULT_EXCLUDED_CATEGORIES,
    } = options;

    // Obtener todos los productos activos
    const whereClause: any = {
      isActive: true,
      price: {
        gt: 0
      }
    };

    if (excludeCategories.length > 0) {
      whereClause.category = {
        name: {
          notIn: excludeCategories
        }
      };
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        subcategory: true,
        image: true,
        modifierGroups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    // Filtrar productos excluidos por nombre
    const filteredProducts = products.filter(
      product => !MENU_CONFIG.EXCLUDED_PRODUCTS.includes(product.name)
    );

    // Agrupar por categoría y nombre base
    const groupedByCategory: Record<string, Record<string, ProductGroupDto>> = {};

    for (const product of filteredProducts) {
      const categoryName = product.category?.name || 'Sin categoría';

      // Normalizar el nombre del producto primero
      const normalizedName = this.normalizeProductName(product.name);

      // Extraer cantidad de piezas del nombre normalizado
      // Patrones: "*12P ", "*15P ", "*4 PIEZAS", "*9 PIEZAS", "*3", "*6"
      const piecesMatch = normalizedName.match(/\*(\d+)(?:P\s|\s*PIEZAS?|\s*$)/i);

      let pieces: number;
      let baseName: string;

      if (piecesMatch) {
        // Producto con variantes de piezas
        pieces = Number(piecesMatch[1]);
        baseName = normalizedName
          .replace(/\*\d+P\s/gi, '')
          .replace(/\*\d+\s*PIEZAS?/i, '')
          .replace(/\*\d+\s*$/i, '')
          .trim();

        // Normalizar espacios dobles que puedan quedar después de eliminar las piezas
        while (baseName.includes('  ')) {
          baseName = baseName.replace(/\s{2,}/g, ' ');
        }
        baseName = baseName.trim();
      } else {
        // Producto sin variantes de piezas (ej: Sushiburgers, Ensaladas, etc.)
        // Usar el nombre completo como base y pieces = 1
        pieces = 1;
        baseName = normalizedName;
      }

      // Inicializar categoría si no existe
      if (!groupedByCategory[categoryName]) {
        groupedByCategory[categoryName] = {};
      }

      // Inicializar grupo si no existe
      if (!groupedByCategory[categoryName][baseName]) {
        groupedByCategory[categoryName][baseName] = {
          baseName,
          imageUrl: product.image?.imageUrl || undefined,
          description: product.description || undefined,
          modifiersCount: product.modifierGroups.length,
          variants: [],
        };
      }

      // Agregar variante
      groupedByCategory[categoryName][baseName].variants.push({
        id: product.id,
        pieces,
        price: Number(product.price),
        priceFormatted: `$${Number(product.price).toLocaleString('es-AR')}`,
      });
    }

    // Convertir a array y ordenar variantes por cantidad de piezas
    const categories: GroupedCategoryDto[] = Object.entries(groupedByCategory).map(([categoryName, groups]) => {
      const groupsArray = Object.values(groups);

      // Ordenar variantes dentro de cada grupo por cantidad de piezas
      groupsArray.forEach(group => {
        group.variants.sort((a, b) => a.pieces - b.pieces);
      });

      // Ordenar grupos alfabéticamente por baseName
      groupsArray.sort((a, b) => a.baseName.localeCompare(b.baseName, 'es', { numeric: true }));

      return {
        name: categoryName,
        groups: groupsArray,
      };
    });

    // Ordenar categorías según prioridad
    const orderedCategories = sortCategoriesByPriority(categories);

    return {
      categories: orderedCategories,
    };
  }
}

