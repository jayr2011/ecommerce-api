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
        return {
          variantId,
          qty: item.qty,
          unitPrice: item.unitPrice,
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
    return order;
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
