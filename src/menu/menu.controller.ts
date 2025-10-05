import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { MenuCategoryDto } from './dto/menu-response.dto';
import { GroupedMenuResponseDto } from './dto/grouped-menu-response.dto';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get full menu with products and modifiers' })
  @ApiQuery({
    name: 'excludeCategories',
    required: false,
    description: 'Comma-separated list of categories to exclude',
    example: 'Opcionales,Bebidas,Salsas',
  })
  @ApiQuery({
    name: 'groupBySubcategory',
    required: false,
    type: Boolean,
    description: 'Whether to group products by subcategory',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the complete menu grouped by categories',
    type: [MenuCategoryDto],
  })
  async getMenu(
    @Query('excludeCategories') excludeCategories?: string,
    @Query('groupBySubcategory') groupBySubcategory?: string,
  ): Promise<MenuCategoryDto[]> {
    // Si no se especifica excludeCategories, usar undefined para que el servicio use los defaults
    const excludedCategoriesList = excludeCategories
      ? excludeCategories.split(',').map(c => c.trim())
      : undefined;

    const shouldGroupBySubcategory = groupBySubcategory === 'true';

    return this.menuService.getMenu({
      excludeCategories: excludedCategoriesList,
      groupBySubcategory: shouldGroupBySubcategory,
    });
  }

  @Get('grouped')
  @ApiOperation({
    summary: 'Get menu grouped by product base name',
    description: 'Returns products grouped by base name with their variants (different piece counts). Example: "COMBINADO Nº1 MIXTO" with variants for 12P, 15P, 18P, etc.'
  })
  @ApiQuery({
    name: 'excludeCategories',
    required: false,
    description: 'Comma-separated list of categories to exclude',
    example: 'Opcionales,Bebidas,Salsas',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the menu grouped by product base name with variants',
    type: GroupedMenuResponseDto,
  })
  async getGroupedMenu(
    @Query('excludeCategories') excludeCategories?: string,
  ): Promise<GroupedMenuResponseDto> {
    const excludedCategoriesList = excludeCategories
      ? excludeCategories.split(',').map(c => c.trim())
      : undefined;

    return this.menuService.getGroupedMenu({
      excludeCategories: excludedCategoriesList,
    });
  }
}

