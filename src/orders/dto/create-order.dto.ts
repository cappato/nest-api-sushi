import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsNumber,
  Matches,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { DeliveryType, PaymentMethod } from '@prisma/client';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  fullName: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\+\d][\d\s\-\(\)]{7,20}$/, {
    message: 'El teléfono no tiene un formato válido',
  })
  phone?: string;

  @IsEnum(DeliveryType, { message: 'El tipo de entrega debe ser RETIRO o ENVIO' })
  deliveryType: DeliveryType;

  @IsOptional()
  @IsObject({ message: 'La dirección debe ser un objeto válido' })
  address?: {
    street?: string;
    floor?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    reference?: string;
  };

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número válido' })
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número válido' })
  lng?: number;

  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser texto' })
  comments?: string;

  @IsEnum(PaymentMethod, { message: 'El método de pago debe ser EFECTIVO, TRANSFERENCIA o MERCADO_PAGO' })
  paymentMethod: PaymentMethod;

  @IsArray({ message: 'Los items deben ser un array' })
  @ArrayMinSize(1, { message: 'El carrito no puede estar vacío' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

