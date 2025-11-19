export function TipoDeTarjeta(cardNumber: string): string {
  const num = cardNumber.replace(/\D/g, "");

  if (/^4/.test(num)) return "Visa";
  if (/^(5[1-5])/.test(num)) return "Mastercard";
  if (/^2(2[2-9][1-9]|[3-6][0-9]{2}|7[01][0-9]|720)/.test(num))
    return "Mastercard";

  return "Desconocida";
}

export function FormatearTarjeta(cardNumber: string): string {
  const num = cardNumber.replace(/[^*\d]/g, "");
  return num.replace(/(.{4})/g, "$1 ").trim();
}