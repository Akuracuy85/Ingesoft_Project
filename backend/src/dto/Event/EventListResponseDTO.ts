import { ZonaDto } from "../evento/ZonaDto";

export interface EventListResponseDTO {

  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  departamento: string;
  provincia: string;
  distrito: string;
  place: string;
  image: string;
  artistName: string;
  category?: string;
  zonas: ZonaDto[];
  imagePlace?: string;
}