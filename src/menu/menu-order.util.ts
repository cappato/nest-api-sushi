import { MENU_CONFIG } from './menu.config';
import { GroupedCategoryDto } from './dto/grouped-menu-response.dto';
import { MenuCategoryDto } from './dto/menu-response.dto';

type Category = GroupedCategoryDto | MenuCategoryDto;

/**
 * Ordena las categorías según la prioridad definida en MENU_CONFIG
 * Las categorías en CATEGORY_PRIORITY aparecen primero en ese orden
 * Las categorías en CATEGORIES_AT_END aparecen al final
 * Las demás aparecen en orden alfabético entre ambos grupos
 */
export function sortCategoriesByPriority<T extends Category>(categories: T[]): T[] {
  const { CATEGORY_PRIORITY, CATEGORIES_AT_END } = MENU_CONFIG;

  const getCategoryName = (cat: Category): string => {
    return 'category' in cat ? cat.category : cat.name;
  };

  const sortByPriority = (a: string, b: string): number => {
    const indexA = CATEGORY_PRIORITY.indexOf(a);
    const indexB = CATEGORY_PRIORITY.indexOf(b);
    
    const priorityA = indexA === -1 ? 999 : indexA;
    const priorityB = indexB === -1 ? 999 : indexB;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return a.localeCompare(b);
  };

  const regularCategories = categories.filter(
    (cat) => !CATEGORIES_AT_END.includes(getCategoryName(cat)),
  );
  
  const endCategories = categories.filter((cat) =>
    CATEGORIES_AT_END.includes(getCategoryName(cat)),
  );

  regularCategories.sort((a, b) =>
    sortByPriority(getCategoryName(a), getCategoryName(b)),
  );

  return [...regularCategories, ...endCategories];
}

