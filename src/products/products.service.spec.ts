import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductDto } from './dto/product.dto';
import { ProductSort } from './dto/list-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct = {
    id: 'p1',
    title: 'Product 1',
    slug: 'product-1',
    description: 'desc',
    priceCents: 1000,
    active: true,
    categoryId: 'c1',
    category: { id: 'c1', name: 'Cat', slug: 'cat' },
    variants: [{ id: 'v1', sku: 'sku1', stock: 10 }],
  };

  const mockProductDto: ProductDto = {
    id: 'p1',
    title: 'Product 1',
    description: 'desc',
    priceCents: 1000,
    active: true,
    categoryId: 'c1',
    category: { id: 'c1', name: 'Cat', slug: 'cat' },
    variants: [{ id: 'v1', sku: 'sku1', stock: 10 }],
  };

  const mockPrisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([mockProduct]),
      findUnique: jest.fn().mockResolvedValue(mockProduct),
      create: jest.fn().mockResolvedValue(mockProduct),
      update: jest.fn().mockResolvedValue(mockProduct),
      delete: jest.fn().mockResolvedValue(mockProduct),
      count: jest.fn().mockResolvedValue(1),
    },
    $transaction: jest
      .fn()
      .mockImplementation((arr: any[]) => Promise.all(arr)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('list calls prisma.product.findMany and returns mapped DTOs', async () => {
    const result = await service.list({});
    expect(mockPrisma.product.findMany).toHaveBeenCalled();
    expect(result.items).toEqual([mockProductDto]);
    expect(result.total).toBe(1);
  });

  it('list applies search query correctly', async () => {
    await service.list({ q: 'search' });
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          AND: expect.arrayContaining([
            {
              OR: [
                { title: { contains: 'search', mode: 'insensitive' } },
                { description: { contains: 'search', mode: 'insensitive' } },
              ],
            },
          ]),
        },
      }),
    );
  });

  it('list applies category filter correctly', async () => {
    await service.list({ category: 'cat-slug' });
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          AND: expect.arrayContaining([
            {},
            { category: { slug: 'cat-slug' } },
          ]),
        },
      }),
    );
  });

  it('list applies price range filters correctly', async () => {
    await service.list({ min: 500, max: 1500 });
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            {},
            {},
            { priceCents: { gte: 500 } },
            { priceCents: { lte: 1500 } },
          ]),
        }),
      }),
    );
  });

  it('list applies sorting correctly', async () => {
    await service.list({ sort: ProductSort.PRICE_DESC });
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { priceCents: 'desc' },
      }),
    );
  });

  it('bySlug calls prisma.product.findUnique with slug and returns mapped DTO', async () => {
    const result = await service.bySlug('product-1');
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { slug: 'product-1' },
      include: { variants: true, category: true },
    });
    expect(result).toEqual(mockProductDto);
  });

  it('bySlug returns null when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(null);
    const result = await service.bySlug('not-found');
    expect(result).toBeNull();
  });

  it('create calls prisma.product.create with dto and returns mapped DTO', async () => {
    const dto = { title: 'New Product', slug: 'new-product', priceCents: 2000 };
    const result = await service.create(dto);
    expect(mockPrisma.product.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toEqual(mockProductDto);
  });

  it('update throws NotFoundException when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(null);
    await expect(service.update('not-found', {})).rejects.toThrow(
      'Product not found',
    );
  });

  it('update calls prisma.product.update and returns mapped DTO when product exists', async () => {
    const dto = { title: 'Updated Product' };
    const result = await service.update('p1', dto);
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: dto,
      include: { category: true, variants: true },
    });
    expect(result).toEqual(mockProductDto);
  });

  it('delete throws NotFoundException when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(null);
    await expect(service.delete('not-found')).rejects.toThrow(
      'Product not found',
    );
  });

  it('delete calls prisma.product.delete and returns mapped DTO when product exists', async () => {
    const result = await service.delete('p1');
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      include: { category: true, variants: true },
    });
    expect(mockPrisma.product.delete).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
    expect(result).toEqual(mockProductDto);
  });
});
