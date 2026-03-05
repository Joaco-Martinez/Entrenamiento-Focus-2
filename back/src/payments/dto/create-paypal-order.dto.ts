import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PaypalItemDto {
  @IsString()
  id: string;

  @IsNumber()
  quantity: number;
}

export class CreatePaypalOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaypalItemDto)
  items: PaypalItemDto[];
}
