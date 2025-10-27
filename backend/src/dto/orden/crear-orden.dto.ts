// CAMBIO: [2025-10-26] - Refactor: Eliminada lógica de puntos
// Se elimina 'puntosUtilizados' del DTO.
// La nueva lógica de negocio indica que los puntos solo se ganan, no se gastan aquí.
import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsInt, 
  IsNotEmpty, 
  IsString, 
  ValidateNested 
} from 'class-validator';

// DTO para cada item (zona + DNIs)
class CrearOrdenItemDto {
  @IsInt()
  @IsNotEmpty()
  zonaId: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  dnis: string[];
}

// DTO principal para la orden
export class CrearOrdenDto {
  @IsInt()
  @IsNotEmpty()
  eventoId: number;

  @IsArray()
  @ValidateNested({ each: true }) // Valida cada item del array
  @Type(() => CrearOrdenItemDto)
  items: CrearOrdenItemDto[];
}