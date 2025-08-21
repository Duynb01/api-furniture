import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartsModule } from '../carts/carts.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [CartsModule, VouchersModule, ProductsModule, forwardRef(() => PaymentsModule)],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
