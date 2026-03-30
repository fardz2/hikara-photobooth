export function computeCRC16(str: string): string {
  let crc = 0xFFFF;
  const poly = 0x1021;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ poly) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const STATIC_QRIS = "00020101021126590013ID.CO.BNI.WWW011893600009150449128902096095344520303UMI51450015ID.OR.GPNQR.WWW0215ID10264833364460303UMI5204722153033605802ID5915HIKARA PHOTOBOX6008KOTABARU6105721136304";

export function generateDynamicQRIS(amount: number): string {
  // 1. Change Point of Initiation Method from 11 (Static) to 12 (Dynamic)
  let qris = STATIC_QRIS.replace("010211", "010212");
  
  // 2. Prepare Amount Tag (Tag 54)
  const amountStr = Math.round(amount).toString();
  const amountTag = `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`;
  
  // 3. Insert amountTag before Tag 63 (CRC)
  // STATIC_QRIS ends with "6304" (Tag 63, Length 04)
  if (qris.endsWith("6304")) {
    const base = qris.substring(0, qris.length - 4);
    const tag63 = "6304";
    const combined = base + amountTag + tag63;
    return combined + computeCRC16(combined);
  }
  
  // Fallback
  const combined = qris + amountTag + "6304";
  return combined + computeCRC16(combined);
}
