import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as xlsx from 'xlsx';

type Row = Record<string, any>;

@Injectable()
export class FudoImportService {
  private readonly logger = new Logger(FudoImportService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async importFromBuffer(buffer: Buffer) {

    const wb = xlsx.read(buffer, { type: 'buffer' });

    const normalizeHeaders = (rows: Row[]): Row[] => {
      return rows.map((row) => {
        const normalized: Row = {};
        for (const key of Object.keys(row)) {
          const cleanKey = key
            .replace(/\r?\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          normalized[cleanKey] = row[key];
        }
        return normalized;
      });
    };

    const get = (name: string) => {
      if (!wb.Sheets[name]) {
        this.logger.warn(`Sheet "${name}" not found in Excel file`);
        return [];
      }
      const raw = xlsx.utils.sheet_to_json<Row>(wb.Sheets[name], { defval: null });
      return normalizeHeaders(raw);
    };

    const productos = get('Productos');
    const ingredientes = get('Ingredientes');
    const gmLogica = get('G. modif. | Paso 1) Lógica');
    const gmComp = get('G. modif. | Paso 2) Composición');
    const gmAssoc = get('G. modif. | Paso 3) Asociación');

    const stats = { products: 0, ingredients: 0, groups: 0, groupItems: 0, groupAssoc: 0 };
    const warnings: string[] = [];

    const providerIdByName = new Map<string, number>();
    const categoryIdByKey = new Map<string, number>();
    const productIdByName = new Map<string, number>();
    const groupIdByName = new Map<string, number>();

    const prisma = this.prisma;

    const normStr = (v: any) => (v ?? '').toString().trim();
    const normBoolSI = (v: any) => {
      const s = normStr(v).toLowerCase();
      return ['si', 'sí', 'true', '1', 'x'].includes(s);
    };
    const toNumber = (v: any): number => {
      if (v === null || v === undefined || v === '') return NaN;
      const s = v.toString().replace(/\./g, '').replace(',', '.');
      const n = Number(s);
      return isNaN(n) ? NaN : n;
    };
    const unitMap = (v: any): 'UNID' | 'KG' | 'L' => {
      const s = normStr(v).toLowerCase();
      if (s.startsWith('kg')) return 'KG';
      if (s.startsWith('l')) return 'L';
      return 'UNID';
    };
    const logicMap = (v: any): 'SUM' | 'MAX' => {
      const s = normStr(v).toLowerCase();
      if (s.startsWith('máx') || s.startsWith('max')) return 'MAX';
      return 'SUM';
    };

    const upsertProvider = async (nameRaw: any) => {
      const name = normStr(nameRaw);
      if (!name) return null;
      if (providerIdByName.has(name)) return providerIdByName.get(name)!;
      const row = await prisma.provider.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      providerIdByName.set(name, row.id);
      return row.id;
    };

    const upsertCategory = async (name: string, parentId?: number | null) => {
      const key = `${parentId ?? 0}::${name}`;
      if (categoryIdByKey.has(key)) return categoryIdByKey.get(key)!;

      let row = await prisma.category.findFirst({
        where: { name, parentId: parentId ?? null },
        select: { id: true },
      });

      if (!row) {
        row = await prisma.category.create({
          data: { name, parentId: parentId ?? null },
          select: { id: true },
        });
      }

      categoryIdByKey.set(key, row.id);
      return row.id;
    };

    this.logger.log('Starting import: Productos');
    for (const r of productos) {
      const extIdRaw = toNumber(r['ID (Uso interno)']);
      if (isNaN(extIdRaw) || extIdRaw <= 0) {
        warnings.push(`Producto sin ID (Uso interno) válido: ${r['Nombre*']}`);
        continue;
      }
      const extId = BigInt(Math.trunc(extIdRaw));

      const name = normStr(r['Nombre*']);
      if (!name) {
        warnings.push(`Producto ${extId} sin Nombre*`);
        continue;
      }

      const price = toNumber(r['Precio*']);
      if (isNaN(price)) {
        warnings.push(`Producto ${extId} (${name}) sin Precio* válido`);
        continue;
      }

      const providerId = await upsertProvider(r['Proveedor']);
      const catName = normStr(r['Categoría*']);
      const subName = normStr(r['Subcategoría']);
      const categoryId = catName ? await upsertCategory(catName, null) : null;
      const subcategoryId = subName ? await upsertCategory(subName, categoryId) : null;

      const code = normStr(r['Código']) || null;
      const description = normStr(r['Descripción']) || null;

      const costRaw = toNumber(r['Costo']);
      const cost = isNaN(costRaw) ? null : costRaw;

      const isActive = normBoolSI(r['Activo (SÍ / NO)']);
      const isFavorite = normBoolSI(r['Favorito (SÍ / NO)']);
      const trackStock = normBoolSI(r['Controlar stock (SÍ / NO)']);
      const sellableAlone = normBoolSI(r['Permitir vender solo (SÍ / NO)']);
      const sortWeightRaw = toNumber(r['Posición']);
      const sortWeight = isNaN(sortWeightRaw) ? null : Math.trunc(sortWeightRaw);

      const prod = await prisma.product.upsert({
        where: { externalSource_externalId: { externalSource: 'fudo', externalId: extId } },
        create: {
          externalSource: 'fudo',
          externalId: extId,
          code,
          name,
          description,
          price,
          cost,
          isActive,
          isFavorite,
          trackStock,
          sellableAlone,
          sortWeight,
          providerId: providerId ?? undefined,
          categoryId: categoryId ?? undefined,
          subcategoryId: subcategoryId ?? undefined,
        },
        update: {
          code,
          name,
          description,
          price,
          cost,
          isActive,
          isFavorite,
          trackStock,
          sellableAlone,
          sortWeight,
          providerId: providerId ?? undefined,
          categoryId: categoryId ?? undefined,
          subcategoryId: subcategoryId ?? undefined,
        },
        select: { id: true, name: true },
      });

      productIdByName.set(prod.name, prod.id);
      stats.products++;
    }

    this.logger.log(`Imported ${stats.products} products`);

    this.logger.log('Starting import: Ingredientes');
    for (const r of ingredientes) {
      const extIdRaw = toNumber(r['ID (Uso interno)']);
      if (isNaN(extIdRaw) || extIdRaw <= 0) {
        warnings.push(`Ingrediente sin ID válido: ${r['Nombre*']}`);
        continue;
      }
      const extId = BigInt(Math.trunc(extIdRaw));

      const name = normStr(r['Nombre*']);
      if (!name) {
        warnings.push(`Ingrediente ${extId} sin Nombre*`);
        continue;
      }
      const unit = unitMap(r['Unidad (unid/kg/L)']);
      const trackStock = normBoolSI(r['Controlar stock (SÍ / NO)']);
      const providerId = await upsertProvider(r['Proveedor']);

      await prisma.ingredient.upsert({
        where: { externalSource_externalId: { externalSource: 'fudo', externalId: extId } },
        create: {
          externalSource: 'fudo',
          externalId: extId,
          name,
          unit,
          trackStock,
          providerId: providerId ?? undefined,
        },
        update: {
          name,
          unit,
          trackStock,
          providerId: providerId ?? undefined,
        },
      });
      stats.ingredients++;
    }

    this.logger.log(`Imported ${stats.ingredients} ingredients`);

    this.logger.log('Starting import: Modifier Groups - Logic');
    for (const r of gmLogica) {
      const name = normStr(r['Nombre*']);
      if (!name) continue;
      const publicName = normStr(r['Nombre público']);
      const logic = logicMap(r['Lógica de precio final (Suma/Máximo)']);
      const minQty = Number.isFinite(toNumber(r['Mínimo de selección']))
        ? Math.trunc(toNumber(r['Mínimo de selección']))
        : null;
      const maxQty = Number.isFinite(toNumber(r['Máximo de selección']))
        ? Math.trunc(toNumber(r['Máximo de selección']))
        : null;

      const row = await prisma.modifierGroup.upsert({
        where: { name },
        create: {
          name,
          publicName: publicName || null,
          logic,
          minQty: minQty ?? undefined,
          maxQty: maxQty ?? undefined,
        },
        update: {
          publicName: publicName || null,
          logic,
          minQty: minQty ?? undefined,
          maxQty: maxQty ?? undefined,
        },
        select: { id: true },
      });
      groupIdByName.set(name, row.id);
      stats.groups++;
    }

    this.logger.log(`Imported ${stats.groups} modifier groups`);

    this.logger.log('Starting import: Modifier Groups - Composition');
    for (const r of gmComp) {
      const groupName = normStr(r['Grupo modificador*']);
      const productName = normStr(r['Producto*']);
      if (!groupName || !productName) continue;

      const groupId = groupIdByName.get(groupName);
      const productId = productIdByName.get(productName);

      if (!groupId) {
        warnings.push(`Grupo no encontrado (Composición): ${groupName}`);
        continue;
      }
      if (!productId) {
        warnings.push(`Producto no encontrado (Composición): ${productName}`);
        continue;
      }

      const price = Number.isFinite(toNumber(r['Precio*'])) ? toNumber(r['Precio*']) : 0;
      const perItemMax = Number.isFinite(toNumber(r['Cant. máxima (que podrá elegirse de cada producto)']))
        ? Math.trunc(toNumber(r['Cant. máxima (que podrá elegirse de cada producto)']))
        : null;

      await prisma.modifierGroupItem.upsert({
        where: { groupId_productId: { groupId, productId } },
        create: { groupId, productId, price, perItemMax: perItemMax ?? undefined },
        update: { price, perItemMax: perItemMax ?? undefined },
      });
      stats.groupItems++;
    }

    this.logger.log(`Imported ${stats.groupItems} modifier group items`);

    this.logger.log('Starting import: Modifier Groups - Association');
    for (const r of gmAssoc) {
      const groupName = normStr(r['Grupo modificador*']);
      const productName = normStr(r['Producto asociado*']);
      if (!groupName || !productName) continue;

      const groupId = groupIdByName.get(groupName);
      const productId = productIdByName.get(productName);

      if (!groupId) {
        warnings.push(`Grupo no encontrado (Asociación): ${groupName}`);
        continue;
      }
      if (!productId) {
        warnings.push(`Producto no encontrado (Asociación): ${productName}`);
        continue;
      }

      await prisma.productModifierGroup.upsert({
        where: { productId_groupId: { productId, groupId } },
        create: { productId, groupId },
        update: {},
      });
      stats.groupAssoc++;
    }

    this.logger.log(`Imported ${stats.groupAssoc} modifier group associations`);

    this.logger.log('--- IMPORT FUDO DONE ---');
    this.logger.log(JSON.stringify({ stats, warningsCount: warnings.length }, null, 2));
    if (warnings.length) {
      this.logger.warn('Warnings:');
      for (const w of warnings) this.logger.warn(`- ${w}`);
    }

    return { stats, warnings };
  }
}

