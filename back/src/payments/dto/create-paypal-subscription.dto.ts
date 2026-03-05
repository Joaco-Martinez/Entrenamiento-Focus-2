import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaypalSubscriptionDto {
  @IsNumber()
  productId: number;

  // opcional: si querés overridear URLs desde frontend
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
