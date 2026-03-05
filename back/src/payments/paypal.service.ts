/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/user.service';

type PaypalCreateOrderResponse = {
  id: string;
  links?: { href: string; rel: string; method: string }[];
};

type PaypalCaptureResponse = {
  id: string;
  status: string;
};

type PaypalVerifySignatureResponse = {
  verification_status: 'SUCCESS' | 'FAILURE';
};

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  private env() {
    return (
      this.configService.get<string>('PAYPAL_ENV') || 'sandbox'
    ).toLowerCase();
  }

  private baseUrl() {
    return this.env() === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private frontendUrl() {
    // Ideal: FRONTEND_URL. Si no existe, cae a BASE_URL.
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('BASE_URL') ||
      'http://localhost:3000'
    );
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !secret) {
      throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET faltan en .env');
    }

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    const res = await fetch(`${this.baseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`PayPal token error: ${text}`);
      throw new Error('No se pudo obtener access token de PayPal');
    }

    const data: any = await res.json();
    return data.access_token;
  }

  /* =========================
      PAYPAL CHECKOUT (PRODUCTOS)
  ========================= */

  async createOrder(items: { id: string; quantity: number }[], userId: string) {
    try {
      const validated = await Promise.all(
        items.map(async (it) => {
          const p = await this.productsService.findOne(Number(it.id));
          if (!p) throw new BadRequestException(`Producto ${it.id} no existe`);
          if (p.isSubscription)
            throw new BadRequestException(
              'PayPal checkout acá es solo productos (no membresías)',
            );

          return {
            product: p,
            quantity: Number(it.quantity),
            unitUsd: Number((p as any).priceUsd ?? 0),
          };
        }),
      );

      const totalUsd = validated.reduce(
        (sum, x) => sum + x.unitUsd * x.quantity,
        0,
      );

      const productsForOrder = validated.map((x) => x.product);
      const order = await this.ordersService.create(
        userId,
        productsForOrder,
        totalUsd,
      );

      const token = await this.getAccessToken();

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: String(order.id),
            custom_id: String(order.id),
            amount: { currency_code: 'USD', value: totalUsd.toFixed(2) },
          },
        ],
      };

      const res = await fetch(`${this.baseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`PayPal create order error: ${text}`);
        throw new InternalServerErrorException('Error creando orden en PayPal');
      }

      const data = (await res.json()) as PaypalCreateOrderResponse;

      await this.ordersService.setPaypalOrderId(order.id, data.id);

      const approveUrl = data.links?.find((l) => l.rel === 'approve')?.href;

      return { paypalOrderId: data.id, approveUrl, orderId: order.id };
    } catch (e: any) {
      this.logger.error(`PayPal createOrder: ${e.message}`);
      throw e;
    }
  }

  async captureOrder(paypalOrderId: string, _userId: string) {
    try {
      const token = await this.getAccessToken();

      const res = await fetch(
        `${this.baseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`PayPal capture error: ${text}`);
        throw new InternalServerErrorException('Error capturando pago PayPal');
      }

      const data = (await res.json()) as PaypalCaptureResponse;

      const order = await this.ordersService.findByPaypalOrderId(paypalOrderId);
      if (order && order.status !== 'approved') {
        await this.ordersService.updateStatus(
          order.id,
          'approved',
          paypalOrderId,
        );
      }

      return { status: data.status, paypalOrderId };
    } catch (e: any) {
      this.logger.error(`PayPal captureOrder: ${e.message}`);
      throw e;
    }
  }

  /* =========================
      PAYPAL SUBSCRIPTIONS (MEMBRESÍAS)
  ========================= */

  async createSubscription(params: {
    productId: number;
    userId: string;
    userEmail: string;
    returnUrl?: string;
    cancelUrl?: string;
  }) {
    const { productId, userId, userEmail } = params;

    const product = await this.productsService.findOne(productId);
    if (!product)
      throw new NotFoundException(`Producto/Plan ${productId} no existe`);
    if (!product.isSubscription)
      throw new BadRequestException(
        'Este producto no está marcado como suscripción',
      );

    // ✅ NECESITÁS un plan_id de PayPal
    // O lo guardás en el producto (paypalPlanId), o usás uno global por env.
    const planId =
      (product as any).paypalPlanId ||
      this.configService.get<string>('PAYPAL_PLAN_ID');

    if (!planId) {
      throw new BadRequestException(
        'Falta PAYPAL_PLAN_ID o product.paypalPlanId para crear la suscripción en PayPal',
      );
    }

    const token = await this.getAccessToken();

    const returnUrl =
      params.returnUrl || `${this.frontendUrl()}/pay/paypal/success`;
    const cancelUrl =
      params.cancelUrl || `${this.frontendUrl()}/pay/paypal/cancel`;

    const payload: any = {
      plan_id: planId,

      // 🔥 clave para linkear webhook -> usuario
      custom_id: String(userId),

      subscriber: {
        email_address: userEmail,
      },

      application_context: {
        brand_name:
          this.configService.get<string>('PAYPAL_BRAND_NAME') ||
          'Entrenamiento Focus',
        locale: 'es-AR',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    const res = await fetch(`${this.baseUrl()}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`PayPal create subscription error: ${text}`);
      throw new InternalServerErrorException(
        'Error creando suscripción en PayPal',
      );
    }

    const data: any = await res.json();
    const subscriptionId = data.id as string | undefined;

    if (subscriptionId) {
      // guardamos como "pendiente" hasta que webhook confirme ACTIVATED
      await this.usersService.updateSubscriptionStatus(userId, {
        subscriptionId,
        subscriptionStartDate: new Date(),
        isPremium: false,
      });
    }

    const approveUrl = Array.isArray(data.links)
      ? data.links.find((l: any) => l.rel === 'approve')?.href
      : undefined;

    return {
      subscriptionId,
      approveUrl,
      status: data.status,
    };
  }

  async cancelSubscription(userId: string, reason?: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (!user.subscriptionId)
      throw new BadRequestException('El usuario no tiene subscriptionId');

    const token = await this.getAccessToken();

    const res = await fetch(
      `${this.baseUrl()}/v1/billing/subscriptions/${user.subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'User requested cancellation',
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`PayPal cancel subscription error: ${text}`);
      throw new InternalServerErrorException(
        'Error cancelando suscripción en PayPal',
      );
    }

    await this.usersService.updateSubscriptionStatus(userId, {
      isPremium: false,
      subscriptionEndDate: new Date(),
    });

    return { message: 'Suscripción PayPal cancelada', cancelledAt: new Date() };
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

  /* =========================
      PAYPAL WEBHOOK
      - Verifica firma
      - Actualiza premium por evento
  ========================= */

  async verifyWebhookSignature(
    headers: any,
    webhookEvent: any,
  ): Promise<boolean> {
    try {
      const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');
      if (!webhookId) {
        this.logger.warn(
          'Falta PAYPAL_WEBHOOK_ID en .env (no puedo verificar firma)',
        );
        return false;
      }

      const transmissionId = headers['paypal-transmission-id'];
      const transmissionTime = headers['paypal-transmission-time'];
      const certUrl = headers['paypal-cert-url'];
      const authAlgo = headers['paypal-auth-algo'];
      const transmissionSig = headers['paypal-transmission-sig'];

      if (
        !transmissionId ||
        !transmissionTime ||
        !certUrl ||
        !authAlgo ||
        !transmissionSig
      ) {
        this.logger.warn(
          'PayPal webhook sin headers de verificación completos',
        );
        return false;
      }

      const token = await this.getAccessToken();

      const payload = {
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      };

      const res = await fetch(
        `${this.baseUrl()}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`PayPal verify signature error: ${text}`);
        return false;
      }

      const data = (await res.json()) as PaypalVerifySignatureResponse;
      return data.verification_status === 'SUCCESS';
    } catch (e: any) {
      this.logger.error(`PayPal verifyWebhookSignature: ${e.message}`);
      return false;
    }
  }

  async handleWebhookEvent(event: any) {
    try {
      const eventType = event?.event_type as string | undefined;
      const resource = event?.resource;

      if (!eventType) return;

      // Para suscripciones, PayPal manda BILLING.SUBSCRIPTION.*
      if (!eventType.startsWith('BILLING.SUBSCRIPTION.')) return;

      const subscriptionId = resource?.id as string | undefined;
      const customId = resource?.custom_id as string | undefined; // lo seteamos al userId
      const status = resource?.status as string | undefined;

      // fallback: email del suscriptor
      const email = resource?.subscriber?.email_address as string | undefined;

      // Buscar usuario: primero por custom_id (ideal), si no por email
      let user = null as any;
      if (customId) {
        user = await this.usersService.findOneById(customId).catch(() => null);
      }
      if (!user && email) {
        user = await this.usersService.findOneByEmail(email).catch(() => null);
      }
      if (!user) {
        this.logger.warn(
          `PayPal webhook: no encuentro user (custom_id=${customId}, email=${email})`,
        );
        return;
      }

      // Guardar subscriptionId si vino y no lo tenía (o si cambió)
      if (subscriptionId && user.subscriptionId !== subscriptionId) {
        await this.usersService.updateSubscriptionStatus(user.id, {
          subscriptionId,
          subscriptionStartDate: user.subscriptionStartDate || new Date(),
          isPremium: false, // hasta activación
        });
      }

      // Activación / Cancelación
      if (
        eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
        status === 'ACTIVE'
      ) {
        await this.usersService.updateSubscriptionStatus(user.id, {
          isPremium: true,
          subscriptionStartDate: user.subscriptionStartDate || new Date(),
        });
        this.logger.log(`✅ PayPal premium ACTIVADO para ${user.email}`);
      }

      if (
        eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ||
        eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
        eventType === 'BILLING.SUBSCRIPTION.EXPIRED' ||
        status === 'CANCELLED'
      ) {
        await this.usersService.updateSubscriptionStatus(user.id, {
          isPremium: false,
          subscriptionEndDate: new Date(),
        });
        this.logger.log(`⛔ PayPal premium DESACTIVADO para ${user.email}`);
      }
    } catch (e: any) {
      this.logger.error(`PayPal handleWebhookEvent: ${e.message}`);
    }
  }
}
