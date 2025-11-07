import QRCode from 'qrcode';

export async function GenerarQRDeEntrada(ordenId: number, detalleId: number, dni: string) {
  const payload = { ordenId, detalleId, dni };
  return await QRCode.toDataURL(JSON.stringify(payload));
}