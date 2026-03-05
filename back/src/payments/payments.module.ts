import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PaymentsController } from './payments.controller';
import { MercadoPagoService } from './mercado-pago.service';
import { PaypalService } from './paypal.service';

import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [MercadoPagoService, PaypalService],
})
export class PaymentsModule {}
