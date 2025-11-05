// src/dto/orden/calcular-precio.dto.ts
import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsInt, 
  IsNotEmpty, 
  Min,
  ValidateNested 
} from 'class-validator';

// DTO para cada item (zona + cantidad)
class CalcularPrecioItemDto {
  @IsInt()
  @IsNotEmpty()
  zonaId: number;

  @IsInt()
  @Min(1) // Debes calcular al menos 1 entrada
  cantidad: number;
}

// DTO principal para la calculadora
export class CalcularPrecioDto {
  @IsInt()
  @IsNotEmpty()
  eventoId: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true }) // Valida cada item del array
  @Type(() => CalcularPrecioItemDto)
  items: CalcularPrecioItemDto[];
}