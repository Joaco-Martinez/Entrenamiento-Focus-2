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
  Preference,
  Payment,
  PreApproval,
} from 'mercadopago';
import { ProductsService } from 'src/products/products.service';
import { OrdersService } from 'src/orders/orders.service';
import { UsersService } from 'src/users/user.service';
import { Order } from 'src/orders/entities/order.entity';
import { MercadoPagoPaymentResponseDto } from './dto/mercado-pago-payment.dto';
import { MercadoPagoPreApprovalResponseDto } from './dto/mercado-pago-preapproval.dto';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {
    // NO inicializar el cliente aquí, hacerlo lazy para evitar que fallos de token rompan toda la app
  }

  private getClient(): MercadoPagoConfig {
    if (!this.client) {
      const token = this.configService.get<string>('MP_ACCESS_TOKEN');

      if (!token) {
        this.logger.error('MP_ACCESS_TOKEN no encontrado en .env');
        throw new Error('MP_ACCESS_TOKEN no encontrado en el archivo .env');
      }

      this.client = new MercadoPagoConfig({
        accessToken: token,
      });
    }
    return this.client;
  }

  /**
   * 1. CREAR PREFERENCIA PARA PAGOS ÚNICOS
   */
  async createMercadoPagoPreference(
    items: { id: string; quantity: number }[],
    userId?: string,
  ) {
    try {
      const itemsValidated = await Promise.all(
        items.map(async (item) => {
          const productDB = await this.productsService.findOne(Number(item.id));

          if (!productDB) {
            throw new BadRequestException(
              `El producto con ID ${item.id} no existe`,
            );
          }

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
      if (!baseUrl || !webhookUrl) {
        this.logger.warn('BASE_URL o WEBHOOK_URL no configurados');
      }

      // Crear orden en BD (status: pending)
      const totalAmount = itemsValidated.reduce(
        (sum, it) => sum + Number(it.unit_price) * Number(it.quantity),
        0,
      );
      const productsForOrder = await Promise.all(
        items.map(async (it) => {
          return await this.productsService.findOne(Number(it.id));
        }),
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

      // Guardar referencia de preferencia en la orden
      if (preference.id) {
        await this.ordersService.setMercadoPagoId(
          order.id,
          String(preference.id),
        );
      }

      this.logger.log(`Preferencia de pago creada: ${preference.id}`);

      return {
        init_point: preference.init_point,
        orderId: order.id,
      };
    } catch (error) {
      this.logger.error(`Error al crear preferencia de MP: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar el pago con Mercado Pago',
      );
    }
  }

  /**
   * 2. VERIFICAR PAGO ÚNICO (VÍA WEBHOOK)
   */
  async verifyPayment(paymentId: string) {
    try {
      const payment = (await new Payment(this.getClient()).get({
        id: paymentId,
      })) as MercadoPagoPaymentResponseDto;

      // Tratar de localizar la orden por la preference id que generamos al crear la preferencia
      const preferenceId =
        payment?.preference_id || payment?.external_reference;
      let order: Order | null = null;
      if (preferenceId) {
        order = await this.ordersService.findByMercadoPagoId(
          String(preferenceId),
        );
      }

      if (payment.status === 'approved') {
        this.logger.log(`✅ Pago aprobado: ${paymentId}`);
        this.logger.log(`Monto: ${payment.transaction_amount}`);
        this.logger.log(`Usuario: ${this.maskEmail(payment.payer?.email)}`);

        if (order) {
          // Idempotencia: si ya está aprobado, no hacer nada
          if (order.status !== 'approved') {
            await this.ordersService.updateStatus(
              order.id,
              'approved',
              paymentId,
            );
          }
        }
      } else {
        this.logger.log(`Pago ${paymentId} estado: ${payment.status}`);
        if (order && order.status !== payment.status) {
          await this.ordersService.updateStatus(
            order.id,
            payment.status,
            paymentId,
          );
        }
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error al verificar el pago: ${error.message}`);
      throw new InternalServerErrorException('Error al verificar el pago');
    }
  }

  /**
   * 3. CREAR SUSCRIPCIÓN (MENSUALIDADES)
   */
  async createSubscription(
    productId: number,
    userEmail: string,
    userId: string,
  ) {
    try {
      const productDB = await this.productsService.findOne(productId);

      if (!productDB) {
        throw new BadRequestException(`El plan con ID ${productId} no existe`);
      }

      // IMPORTANTE: Tu entidad Product debe tener el campo isSubscription
      if (!productDB.isSubscription) {
        throw new BadRequestException(
          'Este producto no está configurado como suscripción mensual',
        );
      }

      const baseUrl = this.configService.get<string>('BASE_URL');
      const webhookUrl = this.configService.get<string>('WEBHOOK_URL');

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

      this.logger.log(`Suscripción creada para: ${this.maskEmail(userEmail)}`);

      // 🔥 GUARDAR subscriptionId en la BD (IMPORTANTE)
      if (subscription.id) {
        await this.usersService.updateSubscriptionStatus(userId, {
          subscriptionId: subscription.id,
          subscriptionStartDate: new Date(),
          isPremium: false, // Aún no aprobada, espera confirmación
        });

        this.logger.log(
          `✅ Suscripción ID guardada en usuario: ${subscription.id}`,
        );
      }

      return {
        init_point: subscription.init_point,
        subscriptionId: subscription.id, // Devolver también al frontend si lo necesita
      };
    } catch (error) {
      this.logger.error(`Error al crear suscripción de MP: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar la suscripción mensual',
      );
    }
  }

  /**
   * 4. VERIFICAR SUSCRIPCIÓN (VÍA WEBHOOK)
   */
  async verifySubscription(preapprovalId: string) {
    try {
      const subscription = (await new PreApproval(this.getClient()).get({
        id: preapprovalId,
      })) as MercadoPagoPreApprovalResponseDto;

      this.logger.log(`📧 ID Suscripción: ${preapprovalId}`);
      this.logger.log(`Estado: ${subscription?.status}`);
      this.logger.log(`Usuario: ${this.maskEmail(subscription?.payer_email)}`);

      if (subscription.status === 'authorized') {
        this.logger.log(
          `✅ Suscripción exitosa para: ${this.maskEmail(subscription.payer_email)}`,
        );

        // 🔥 BUSCAR USUARIO POR EMAIL Y MARCAR COMO PREMIUM
        const userByEmail = await this.usersService.findOneByEmail(
          subscription.payer_email,
        );
        if (userByEmail && userByEmail.subscriptionId === preapprovalId) {
          await this.usersService.updateSubscriptionStatus(userByEmail.id, {
            isPremium: true,
            subscriptionStartDate: new Date(),
          });
          this.logger.log(`✅ Usuario marcado como PREMIUM en BD`);
        }
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error al verificar suscripción: ${error.message}`);
      return { received: false };
    }
  }

  /**
   * 5. CANCELAR SUSCRIPCIÓN
   */
  async cancelSubscription(userId: string) {
    try {
      // Obtener usuario
      const user = await this.usersService.findOneById(userId);

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (!user.subscriptionId) {
        throw new BadRequestException(
          'El usuario no tiene una suscripción activa',
        );
      }

      if (!user.isPremium) {
        throw new BadRequestException('El usuario no está suscrito a premium');
      }

      // Cancelar pre-aprobación en Mercado Pago
      const preapproval = new PreApproval(this.getClient());

      try {
        await preapproval.update({
          id: user.subscriptionId,
          body: {
            status: 'cancelled',
          },
        });

        this.logger.log(
          `✅ Suscripción cancelada en MP: ${user.subscriptionId}`,
        );
      } catch (error) {
        this.logger.error(`Error al cancelar en MP: ${error.message}`);
        // Continuar de todas formas para actualizar BD
      }

      // Actualizar usuario en BD
      await this.usersService.updateSubscriptionStatus(userId, {
        isPremium: false,
        subscriptionEndDate: new Date(),
      });

      this.logger.log(
        `✅ Suscripción cancelada para usuario: ${this.maskEmail(user.email)}`,
      );

      return {
        message: 'Suscripción cancelada exitosamente',
        email: user.email,
        cancelledAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error al cancelar suscripción: ${error.message}`);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al cancelar la suscripción',
      );
    }
  }

  /**
   * 6. OBTENER ESTADO DE SUSCRIPCIÓN
   */
  async getSubscriptionStatus(userId: string) {
    try {
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
    } catch (error) {
      this.logger.error(
        `Error al obtener estado de suscripción: ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener estado de suscripción',
      );
    }
  }

  /**
   * Enmascarar email para cumplimiento GDPR
   */
  private maskEmail(email: string | undefined): string {
    if (!email) return 'N/A';
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}***@${domain}`;
  }
}
