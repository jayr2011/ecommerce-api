import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/addCartItem.dto';
import { RequestWithUser } from 'src/types/auth.types';

@Controller('cart')
@ApiTags('Cart')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  @ApiOperation({ summary: 'Add item to user cart' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  addItem(
    @Req() req: RequestWithUser,
    @Body() dto: AddCartItemDto,
  ): Promise<AddCartItemDto[]> {
    const userId = req.user?.sub;
    const productId = dto.productId;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.cartService.addItem(userId, productId, dto.quantity ?? 1);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get items in user cart' })
  @ApiResponse({ status: 200, description: 'List of cart items' })
  getItems(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.cartService.getItems(userId);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a specific item from cart' })
  @ApiParam({ name: 'productId', description: 'ID of the product to remove' })
  @ApiResponse({ status: 200, description: 'Updated cart after removal' })
  removeItem(
    @Req() req: RequestWithUser,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.cartService.removeItem(userId, productId);
  }

  @Delete('items')
  @ApiOperation({ summary: 'Clear all items from user cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  clearCart(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.cartService.clearCart(userId);
  }
}
