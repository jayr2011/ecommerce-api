import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/created-product.dto';
import { ProductSort, ListProductsQuery } from './dto/list-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

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

    this.logger.log(
      `list() called — q=${q ?? '-'} category=${category ?? '-'} skip=${skip} take=${take} sort=${sort}`,
    );

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

    this.logger.log(`list() returned ${items.length} items (total=${total})`);

    return { items, total, skip, take };
  }

  bySlug(slug: string) {
    this.logger.log(`bySlug() called — slug=${slug}`);

    return this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true, category: true },
    });
  }

  async create(dto: CreateProductDto) {
    this.logger.log(`create() called — title=${dto.title}`);

    const created = await this.prisma.product.create({ data: dto });

    this.logger.log(`create() success — id=${created.id}`);
    return created;
  }

  async update(id: string, dto: UpdateProductDto) {
    this.logger.log(`update() called — id=${id}`);

    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) {
      this.logger.warn(`update() failed — product not found id=${id}`);
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: dto,
    });
    this.logger.log(`update() success — id=${updated.id}`);
    return updated;
  }

  delete(id: string) {
    this.logger.log(`delete() called — id=${id}`);

    return this.prisma.product.delete({ where: { id } });
  }
}
