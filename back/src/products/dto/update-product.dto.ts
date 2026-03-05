import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ResourceType } from '../enums/resource-type.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // ✅ Precio en ARS
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceArs?: number;

  // ✅ Precio en USD
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceUsd?: number;

  @IsOptional()
  @IsBoolean()
  isSubscription?: boolean;

  // 👉 si deja de ser suscripción, el service se encarga de limpiar paypalPlanId
  @IsOptional()
  @IsString()
  paypalPlanId?: string | null;

  @IsOptional()
  @IsBoolean()
  requiresPremium?: boolean;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  // 🔐 solo admin, nunca se devuelve en GET
  @IsOptional()
  @IsUrl()
  resourceUrl?: string;
}
