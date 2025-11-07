import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/created-product.dto';
import { ProductSort, ListProductsQuery } from './dto/list-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(qs: ListProductsQuery) {
    const {
      q,
      category,
      min,
      max,
      skip = 0,
      take = 20,
      sort = ProductSort.TITLE_ASC,
    } = qs;

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === ProductSort.TITLE_DESC
        ? { title: 'desc' }
        : sort === ProductSort.PRICE_ASC
          ? { priceCents: 'asc' }
          : sort === ProductSort.PRICE_DESC
            ? { priceCents: 'desc' }
            : { title: 'asc' };

    const where: Prisma.ProductWhereInput = {
      active: true,
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {},
        category ? { category: { slug: category } } : {},
        min != null ? { priceCents: { gte: min } } : {},
        max != null ? { priceCents: { lte: max } } : {},
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { category: true, variants: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  bySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true, category: true },
    });
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
