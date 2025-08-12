// src/adapters/discord/verify.ts
import nacl from "tweetnacl"

const HDR_SIG = "X-Signature-Ed25519"
const HDR_TS = "X-Signature-Timestamp"

function getHeaderInsensitive(headers: Headers, key: string): string | null {
  return headers.get(key) ?? headers.get(key.toLowerCase())
}

function hexToUint8(hex: string): Uint8Array {
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("Invalid hex string")
  }
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

/**
 * Discord Ed25519 署名検証
 * - body: raw request body (string)
 * - headers: Request headers
 * - publicKeyHex: Discord Applications の公開鍵（16進）
 */
export function verify(rawBody: string, headers: Headers, publicKeyHex?: string | null): boolean {
  try {
    const signature = getHeaderInsensitive(headers, HDR_SIG)
    const timestamp = getHeaderInsensitive(headers, HDR_TS)
    if (!publicKeyHex || !signature || !timestamp) return false
    const msg = new TextEncoder().encode(timestamp + rawBody)
    return nacl.sign.detached.verify(msg, hexToUint8(signature), hexToUint8(publicKeyHex))
  } catch {
    return false
  }
}