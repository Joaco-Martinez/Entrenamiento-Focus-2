import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { AuthGuard } from '../auth/auth.guard';

import { MercadoPagoService } from './mercado-pago.service';
import { PaypalService } from './paypal.service';

import { CreatePreferenceDto } from './dto/create-preference.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CreatePaypalSubscriptionDto } from './dto/create-paypal-subscription.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly mp: MercadoPagoService,
    private readonly paypal: PaypalService,
    private readonly configService: ConfigService,
  ) {}

  /* =========================
      MERCADO PAGO
  ========================= */

  @UseGuards(AuthGuard)
  @Post('create-preference')
  async createPreference(@Body() dto: CreatePreferenceDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || 'anonymous';
    return this.mp.createMercadoPagoPreference(dto.items, userId);
  }

  @UseGuards(AuthGuard)
  @Post('create-subscription')
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
    @Req() req: any,
  ) {
    const userEmail = req.user?.email;
    const userId = req.user?.sub || req.user?.id;
    if (!userEmail || !userId)
      throw new BadRequestException('Datos de usuario no encontrados en token');
    return this.mp.createSubscription(dto.productId, userEmail, userId);
  }

  @UseGuards(AuthGuard)
  @Post('cancel-subscription')
  async cancelSubscription(
    @Body() _dto: CancelSubscriptionDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new BadRequestException('Usuario no identificado');
    return this.mp.cancelSubscription(userId);
  }

  @UseGuards(AuthGuard)
  @Get('subscription-status')
  async getSubscriptionStatus(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new BadRequestException('Usuario no identificado');
    return this.mp.getSubscriptionStatus(userId);
  }

  @Post('webhook')
  async handleMpWebhook(
    @Query() query: any,
    @Body() body: any,
    @Req() req: any,
  ) {
    // Validación firma MP (igual que tenías)
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];

    if (!xSignature || !xRequestId) {
      this.logger.warn('MP Webhook recibido sin X-Signature o X-Request-ID');
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        throw new BadRequestException('Firma de seguridad no proporcionada');
      }
    } else {
      const ok = this.validateMpWebhookSignature(
        xRequestId,
        xSignature,
        JSON.stringify(body),
      );
      if (!ok && this.configService.get<string>('NODE_ENV') === 'production') {
        throw new BadRequestException('Firma de seguridad inválida');
      }
    }

    if (query.type === 'payment') {
      const paymentId = query['data.id'];
      if (!paymentId)
        throw new BadRequestException('Payment ID no proporcionado');
      return this.mp.verifyPayment(paymentId);
    }

    if (
      body.type === 'subscription_preapproval' ||
      query.type === 'preapproval'
    ) {
      const subscriptionId = body.data?.id || query['data.id'];
      if (!subscriptionId)
        throw new BadRequestException('Subscription ID no proporcionado');
      return this.mp.verifySubscription(subscriptionId);
    }

    return { received: true };
  }

  private validateMpWebhookSignature(
    requestId: string,
    signature: string,
    body: string,
  ): boolean {
    try {
      const secret = this.configService.get<string>('MP_WEBHOOK_SECRET');
      if (!secret) return false;

      const validationString = `id=${requestId};${body}`;
      const hash = crypto
        .createHmac('sha256', secret)
        .update(validationString)
        .digest('base64');
      const receivedHash = signature.split('=')[1];

      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(receivedHash),
      );
    } catch {
      return false;
    }
  }

  /* =========================
      PAYPAL
      - Checkout productos (ya estaba)
      - Suscripciones (nuevo)
      - Webhook (nuevo)
  ========================= */

  // ✅ Productos (checkout clásico)
  @UseGuards(AuthGuard)
  @Post('paypal/create-order')
  async paypalCreateOrder(@Body() dto: CreatePaypalOrderDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new BadRequestException('Usuario no identificado');
    return this.paypal.createOrder(dto.items, userId);
  }

  @UseGuards(AuthGuard)
  @Post('paypal/capture-order')
  async paypalCaptureOrder(@Body() body: { orderId: string }, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new BadRequestException('Usuario no identificado');
    if (!body?.orderId) throw new BadRequestException('orderId requerido');
    return this.paypal.captureOrder(body.orderId, userId);
  }

  // ✅ Suscripción PayPal (membresía)
  @UseGuards(AuthGuard)
  @Post('paypal/create-subscription')
  async paypalCreateSubscription(
    @Body() dto: CreatePaypalSubscriptionDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) throw new BadRequestException('Usuario no identificado');
    if (!userEmail)
      throw new BadRequestException('Email no encontrado en token');

    return this.paypal.createSubscription({
      productId: dto.productId,
      userId,
      userEmail,
      returnUrl: dto.returnUrl,
      cancelUrl: dto.cancelUrl,
    });
  }

  @UseGuards(AuthGuard)
  @Post('paypal/cancel-subscription')
  async paypalCancelSubscription(
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new BadRequestException('Usuario no identificado');
    return this.paypal.cancelSubscription(userId, body?.reason);
  }

  @UseGuards(AuthGuard)
  @Get('paypal/subscription-status')
  async paypalSubscriptionStatus(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new BadRequestException('Usuario no identificado');
    return this.paypal.getSubscriptionStatus(userId);
  }

  // ✅ Webhook PayPal (sin AuthGuard)
  @Post('paypal/webhook')
  async paypalWebhook(@Body() body: any, @Req() req: any) {
    // PayPal recomienda verificar firma vía API /v1/notifications/verify-webhook-signature
    const verified = await this.paypal.verifyWebhookSignature(
      req.headers,
      body,
    );
    if (
      !verified &&
      this.configService.get<string>('NODE_ENV') === 'production'
    ) {
      throw new BadRequestException('Firma de PayPal inválida');
    }

    // Procesar evento (activar/cancelar premium, etc)
    await this.paypal.handleWebhookEvent(body);

    return { received: true };
  }
}
