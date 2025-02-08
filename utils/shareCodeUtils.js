import CryptoJS from "crypto-js";

export function generateShareCode(deviceId) {
  const hash = CryptoJS.SHA256(deviceId).toString(CryptoJS.enc.Hex);
  const uniqueCode = hash.substring(0, 16);

  return `seesafe/${uniqueCode}`;
}
