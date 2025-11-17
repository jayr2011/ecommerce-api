import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    const mappedItems = await Promise.all(
      dto.items.map(async (item) => {
        let variantId = item.variantId;
        if (!variantId && item.productId) {
          const variant = await this.prisma.productVariant.findFirst({
            where: { productId: item.productId },
          });
          if (!variant) throw new NotFoundException('Variant not found');
          variantId = variant.id;
        }
        if (!variantId) throw new NotFoundException('VariantId not provided');
        const unitPriceCents = Math.round(item.unitPrice * 100);
        return {
          variantId,
          qty: item.qty,
          unitPrice: unitPriceCents,
        };
      }),
    );

    const totalCents = mappedItems.reduce(
      (sum, i) => sum + i.qty * i.unitPrice,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        totalCents,
        addressJson: dto.addressJson,
        items: {
          create: mappedItems.map((i) => ({
            variant: { connect: { id: i.variantId } },
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    // Map back to BRL for API responses
    const response = {
      ...order,
      total: Number((order.totalCents / 100).toFixed(2)),
      items: order.items.map((i) => ({ ...i, unitPrice: Number((i.unitPrice / 100).toFixed(2)) })),
    } as any;
    return response;
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return {
      ...order,
      total: Number((order.totalCents / 100).toFixed(2)),
      items: order.items.map((i) => ({ ...i, unitPrice: Number((i.unitPrice / 100).toFixed(2)) })),
    } as any;
  }
}
