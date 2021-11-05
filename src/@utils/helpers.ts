export function generateNumberedSeries(n: number): number[] {
  return Array(n)
    .fill(0)
    .map((_, i) => i + 1);
}

export function sum(numbers: number[] | undefined) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((p, c) => Number(p) + Number(c));
}

function generateString(chars: string, length: number) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateOTP() {
  const digits = '0123456789';
  return generateString(digits, 6);
}

export function generatePassword() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return generateString(chars, 12);
}
