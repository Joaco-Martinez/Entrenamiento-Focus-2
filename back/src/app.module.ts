import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const isProd = nodeEnv === 'production';

        // Acepta DB_URL o DATABASE_URL
        const dbUrl =
          configService.get<string>('DB_URL') ||
          configService.get<string>('DATABASE_URL');

        if (!dbUrl) {
          throw new Error('Falta DB_URL o DATABASE_URL en el .env');
        }

        return {
          type: 'postgres',
          url: dbUrl,

          // Importante en hosts tipo Railway/Render:
          ssl: isProd ? { rejectUnauthorized: false } : false,

          autoLoadEntities: true,
          synchronize: !isProd, // en prod: false
          logging: nodeEnv === 'development',
        };
      },
    }),

    AuthModule,
    UsersModule,
    ProductsModule,
    PaymentsModule, // ✅ acá va MP + PayPal juntos
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
