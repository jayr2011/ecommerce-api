import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductsService } from '../products.service';
import { CreateProductInput } from '../inputs/create-product.input';
import { UpdateProductInput } from '../inputs/update-product.input';
import { ListProductsInput } from '../inputs/list-products.input';
import { ProductOutput } from '../outputs/product.output';

@Resolver()
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [ProductOutput], { name: 'products' })
  async list(@Args('input') input: ListProductsInput) {
    const { q, category, skip, take } = input || {};
    const result = await this.productsService.list({ q, category, skip, take });
    return result.items;
  }

  @Query(() => ProductOutput, { name: 'productBySlug', nullable: true })
  bySlug(@Args('slug') slug: string) {
    return this.productsService.bySlug(slug);
  }

  @Mutation(() => ProductOutput, { name: 'createProduct' })
  create(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => ProductOutput, { name: 'updateProduct' })
  update(@Args('id') id: string, @Args('input') input: UpdateProductInput) {
    return this.productsService.update(id, input);
  }

  @Mutation(() => ProductOutput, { name: 'deleteProduct' })
  delete(@Args('id') id: string) {
    return this.productsService.delete(id);
  }
}
