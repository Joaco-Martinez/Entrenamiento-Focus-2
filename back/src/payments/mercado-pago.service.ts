/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MercadoPagoConfig,
  Payment,
  PreApproval,
  Preference,
} from 'mercadopago';

import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/user.service';
import { Order } from '../orders/entities/order.entity';

import { MercadoPagoPaymentResponseDto } from './dto/mercado-pago-payment.dto';
import { MercadoPagoPreApprovalResponseDto } from './dto/mercado-pago-preapproval.dto';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  private getClient(): MercadoPagoConfig {
    if (!this.client) {
      const token = this.configService.get<string>('MP_ACCESS_TOKEN');
      if (!token) throw new Error('MP_ACCESS_TOKEN no encontrado en .env');
      this.client = new MercadoPagoConfig({ accessToken: token });
    }
    return this.client;
  }

  async createMercadoPagoPreference(
    items: { id: string; quantity: number }[],
    userId?: string,
  ) {
    try {
      const itemsValidated = await Promise.all(
        items.map(async (item) => {
          const productDB = await this.productsService.findOne(Number(item.id));
          if (!productDB)
            throw new BadRequestException(
              `El producto con ID ${item.id} no existe`,
            );

          return {
            id: String(productDB.id),
            title: productDB.name,
            unit_price: Number(productDB.priceArs),
            quantity: Number(item.quantity),
            currency_id: 'ARS',
          };
        }),
      );

      const baseUrl = this.configService.get<string>('BASE_URL');
      const webhookUrl = this.configService.get<string>('WEBHOOK_URL');

      const totalAmount = itemsValidated.reduce(
        (sum, it) => sum + Number(it.unit_price) * Number(it.quantity),
        0,
      );

      const productsForOrder = await Promise.all(
        items.map(async (it) => this.productsService.findOne(Number(it.id))),
      );

      const order = await this.ordersService.create(
        userId ?? 'anonymous',
        productsForOrder,
        totalAmount,
      );

      const preference = await new Preference(this.getClient()).create({
        body: {
          items: itemsValidated,
          external_reference: String(order.id),
          ...(webhookUrl && { notification_url: webhookUrl }),
          back_urls: {
            success: `${baseUrl}/payments/success`,
            failure: `${baseUrl}/payments/failure`,
            pending: `${baseUrl}/payments/pending`,
          },
          auto_return: 'approved',
        },
      });

      if (preference.id)
        await this.ordersService.setMercadoPagoId(
          order.id,
          String(preference.id),
        );

      return { init_point: preference.init_point, orderId: order.id };
    } catch (error: any) {
      this.logger.error(`Error MP create preference: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar el pago con Mercado Pago',
      );
    }
  }

  async verifyPayment(paymentId: string) {
    try {
      const payment = (await new Payment(this.getClient()).get({
        id: paymentId,
      })) as MercadoPagoPaymentResponseDto;

      const preferenceId =
        payment?.preference_id || payment?.external_reference;
      let order: Order | null = null;
      if (preferenceId)
        order = await this.ordersService.findByMercadoPagoId(
          String(preferenceId),
        );

      if (payment.status === 'approved') {
        if (order && order.status !== 'approved') {
          await this.ordersService.updateStatus(
            order.id,
            'approved',
            paymentId,
          );
        }
      } else {
        if (order && order.status !== payment.status) {
          await this.ordersService.updateStatus(
            order.id,
            payment.status,
            paymentId,
          );
        }
      }

      return { received: true };
    } catch (error: any) {
      this.logger.error(`Error MP verify payment: ${error.message}`);
      throw new InternalServerErrorException('Error al verificar el pago');
    }
  }

  async createSubscription(
    productId: number,
    userEmail: string,
    userId: string,
  ) {
    try {
      const productDB = await this.productsService.findOne(productId);
      if (!productDB)
        throw new BadRequestException(`El plan con ID ${productId} no existe`);
      if (!productDB.isSubscription)
        throw new BadRequestException('Este producto no es suscripción');

      const baseUrl = this.configService.get<string>('BASE_URL');

      const subscription = await new PreApproval(this.getClient()).create({
        body: {
          reason: productDB.name,
          payer_email: userEmail,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: Number(productDB.priceArs),
            currency_id: 'ARS',
          },
          back_url: `${baseUrl}/payments/success-subscription`,
          status: 'pending',
        },
      });

      if (subscription.id) {
        await this.usersService.updateSubscriptionStatus(userId, {
          subscriptionId: subscription.id,
          subscriptionStartDate: new Date(),
          isPremium: false,
        });
      }

      return {
        init_point: subscription.init_point,
        subscriptionId: subscription.id,
      };
    } catch (error: any) {
      this.logger.error(`Error MP create subscription: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar la suscripción mensual',
      );
    }
  }

  async verifySubscription(preapprovalId: string) {
    try {
      const subscription = (await new PreApproval(this.getClient()).get({
        id: preapprovalId,
      })) as MercadoPagoPreApprovalResponseDto;

      if (subscription.status === 'authorized') {
        const userByEmail = await this.usersService.findOneByEmail(
          subscription.payer_email,
        );
        if (userByEmail && userByEmail.subscriptionId === preapprovalId) {
          await this.usersService.updateSubscriptionStatus(userByEmail.id, {
            isPremium: true,
            subscriptionStartDate: new Date(),
          });
        }
      }
      return { received: true };
    } catch (error: any) {
      this.logger.error(`Error MP verify subscription: ${error.message}`);
      return { received: false };
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) throw new NotFoundException('Usuario no encontrado');
      if (!user.subscriptionId)
        throw new BadRequestException('No tiene suscripción');
      if (!user.isPremium) throw new BadRequestException('No está premium');

      const preapproval = new PreApproval(this.getClient());
      await preapproval.update({
        id: user.subscriptionId,
        body: { status: 'cancelled' },
      });

      await this.usersService.updateSubscriptionStatus(userId, {
        isPremium: false,
        subscriptionEndDate: new Date(),
      });

      return {
        message: 'Suscripción cancelada exitosamente',
        email: user.email,
        cancelledAt: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Error MP cancel subscription: ${error.message}`);
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.usersService.findOneById(userId);
    return {
      id: user.id,
      email: user.email,
      isPremium: user.isPremium,
      subscriptionId: user.subscriptionId || null,
      subscriptionStartDate: user.subscriptionStartDate || null,
      subscriptionEndDate: user.subscriptionEndDate || null,
      hasActiveSubscription: user.isPremium && !!user.subscriptionId,
    };
  }
}
