const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function base62Id(length = 8) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let output = '';
  for (let index = 0; index < bytes.length; index += 1) {
    output += alphabet[bytes[index]! % alphabet.length];
  }
  return output;
}
