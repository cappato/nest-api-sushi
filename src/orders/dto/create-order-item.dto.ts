import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsOptional()
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive({ message: 'El ID del producto debe ser positivo' })
  productId?: number;

  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString({ message: 'El nombre del producto debe ser texto' })
  name: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @IsPositive({ message: 'El precio unitario debe ser positivo' })
  unitPrice: number;

  @IsNumber({}, { message: 'El precio total debe ser un número' })
  @IsPositive({ message: 'El precio total debe ser positivo' })
  totalPrice: number;
}

