import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProducts = [
    {
      id: 'p1',
      title: 'Product 1',
      slug: 'product-1',
      priceCents: 1000,
      description: 'desc',
      active: true,
      category: { id: 'c1', name: 'Cat', slug: 'cat' },
      variants: [],
    },
  ];

  const mockPrisma = {
    product: {
      findMany: jest.fn().mockResolvedValue(mockProducts),
      findUnique: jest.fn().mockResolvedValue(mockProducts[0]),
      create: jest.fn().mockResolvedValue(mockProducts[0]),
      update: jest
        .fn()
        .mockResolvedValue({ ...mockProducts[0], title: 'Updated' }),
      delete: jest.fn().mockResolvedValue(mockProducts[0]),
      count: jest.fn().mockResolvedValue(mockProducts.length),
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

  it('list calls prisma.product.findMany', async () => {
    await service.list({});
    expect(mockPrisma.product.findMany).toHaveBeenCalled();
  });

  it('list returns paginated result with items and total', async () => {
    const res = await service.list({});
    expect(res).toEqual({
      items: mockProducts,
      total: mockProducts.length,
      skip: 0,
      take: 20,
    });
  });

  it('bySlug calls prisma.product.findUnique with slug', async () => {
    await service.bySlug('product-1');
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { slug: 'product-1' },
      include: { variants: true, category: true },
    });
  });

  it('create calls prisma.product.create with dto', async () => {
    const dto = { title: 'x', slug: 'x-slug', priceCents: 100 };
    await service.create(dto);
    expect(mockPrisma.product.create).toHaveBeenCalledWith({ data: dto });
  });

  it('create returns created product', async () => {
    const dto = { title: 'x', slug: 'x-slug', priceCents: 100 };
    const res = await service.create(dto);
    expect(res).toEqual(mockProducts[0]);
  });

  it('update throws when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(null);
    await expect(service.update('nope', {})).rejects.toThrow(
      'Product not found',
    );
  });

  it('update calls prisma.product.update when exists', async () => {
    const dto = { title: 'Updated' };
    await service.update('p1', dto);
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: dto,
    });
  });

  it('delete calls prisma.product.delete with id', async () => {
    await service.delete('p1');
    expect(mockPrisma.product.delete).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
  });
});
