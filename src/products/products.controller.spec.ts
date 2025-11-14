import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/created-product.dto';
import { ProductSort } from './dto/list-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;

  const mockProduct = {
    id: 'p1',
    title: 'Product 1',
    description: 'desc',
    priceCents: 1000,
    active: true,
    categoryId: 'c1',
    category: { id: 'c1', name: 'Cat', slug: 'cat' },
    variants: [{ id: 'v1', sku: 'sku1', stock: 10 }],
  };

  const mockPaginatedProducts = {
    items: [mockProduct],
    total: 1,
    skip: 0,
    take: 20,
  };

  const mockService = {
    list: jest.fn().mockResolvedValue(mockPaginatedProducts),
    bySlug: jest.fn().mockResolvedValue(mockProduct),
    create: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue(mockProduct),
    delete: jest.fn().mockResolvedValue(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should call productsService.list with correct query params', async () => {
      await controller.list('search', 'cat', 0, 10, ProductSort.PRICE_DESC, 500, 1500);
      expect(mockService.list).toHaveBeenCalledWith({
        q: 'search',
        category: 'cat',
        skip: 0,
        take: 10,
        sort: ProductSort.PRICE_DESC,
        min: 500,
        max: 1500,
      });
    });

    it('should handle undefined query params', async () => {
      await controller.list();
      expect(mockService.list).toHaveBeenCalledWith({
        q: undefined,
        category: undefined,
        skip: 0,
        take: NaN,
        sort: undefined,
        min: undefined,
        max: undefined,
      });
    });

    it('should return paginated products', async () => {
      const result = await controller.list();
      expect(result).toEqual(mockPaginatedProducts);
    });

    it('should propagate errors from service', async () => {
      mockService.list.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.list()).rejects.toThrow('fail');
    });
  });

  describe('bySlug', () => {
    it('should call productsService.bySlug with correct slug', async () => {
      await controller.bySlug('product-slug');
      expect(mockService.bySlug).toHaveBeenCalledWith('product-slug');
    });

    it('should return product by slug', async () => {
      const result = await controller.bySlug('product-slug');
      expect(result).toEqual(mockProduct);
    });

    it('should propagate errors from service', async () => {
      mockService.bySlug.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.bySlug('product-slug')).rejects.toThrow('fail');
    });
  });

  describe('create', () => {
    it('should call productsService.create with correct dto', async () => {
      const createDto: CreateProductDto = {
        title: 'New Product',
        slug: 'new-product',
        priceCents: 2000,
      };
      await controller.create(createDto);
      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });

    it('should return created product', async () => {
      const createDto: CreateProductDto = {
        title: 'New Product',
        slug: 'new-product',
        priceCents: 2000,
      };
      const result = await controller.create(createDto);
      expect(result).toEqual(mockProduct);
    });

    it('should propagate errors from service', async () => {
      const createDto: CreateProductDto = {
        title: 'New Product',
        slug: 'new-product',
        priceCents: 2000,
      };
      mockService.create.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.create(createDto)).rejects.toThrow('fail');
    });
  });

  describe('update', () => {
    it('should call productsService.update with correct id and dto', async () => {
      const updateDto = { title: 'Updated Product' };
      await controller.update('p1', updateDto);
      expect(mockService.update).toHaveBeenCalledWith('p1', updateDto);
    });

    it('should return updated product', async () => {
      const updateDto = { title: 'Updated Product' };
      const result = await controller.update('p1', updateDto);
      expect(result).toEqual(mockProduct);
    });

    it('should propagate errors from service', async () => {
      const updateDto = { title: 'Updated Product' };
      mockService.update.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.update('p1', updateDto)).rejects.toThrow('fail');
    });
  });

  describe('delete', () => {
    it('should call productsService.delete with correct id', async () => {
      await controller.delete('p1');
      expect(mockService.delete).toHaveBeenCalledWith('p1');
    });

    it('should return deleted product', async () => {
      const result = await controller.delete('p1');
      expect(result).toEqual(mockProduct);
    });

    it('should propagate errors from service', async () => {
      mockService.delete.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.delete('p1')).rejects.toThrow('fail');
    });
  });
});
