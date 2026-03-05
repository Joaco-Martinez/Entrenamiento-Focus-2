/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '../enums/resource-type.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // ✅ Precio USD
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceUsd: number;

  // ✅ Precio ARS opcional
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceArs?: number;

  @Type(() => Boolean)
  @IsBoolean()
  isSubscription: boolean;

  // ✅ SOLO si es suscripción
  @ValidateIf((o) => o.isSubscription === true)
  @IsString()
  @IsNotEmpty()
  paypalPlanId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  requiresPremium?: boolean;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsUrl()
  @IsNotEmpty()
  resourceUrl: string;
}
