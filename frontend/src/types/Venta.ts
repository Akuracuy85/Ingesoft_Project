export interface OrganizadorInfo {
  id: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  rol: string;
}

export interface AdminVenta {
  id: number;
  nombreEvento: string;
  fechaEvento: string;
  entradasVendidas: number;
  gananciaTotal: number;
  organizadorNombre: string;
  organizadorRazonSocial: string;
}
