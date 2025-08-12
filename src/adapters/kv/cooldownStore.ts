// src/adapters/kv/cooldownStore.ts
import { COOLDOWN_WINDOW_SEC } from "../../config/constants"

/**
 * ウィンドウ内の連続実行を抑制する簡易クールダウン
 * - ウィンドウ内なら true を返す（ブロック）
 * - そうでなければ現在時刻を書き込み、false を返す
 * - キーの TTL は 60 秒
 */
export async function isCooldown(
  kv: KVNamespace,
  scope: string,
  uid: string,
  windowSec = COOLDOWN_WINDOW_SEC,
): Promise<boolean> {
  const k = `cd:${scope}:${uid}`
  const now = Date.now()
  const raw = await kv.get(k)
  if (raw) {
    const last = Number(raw)
    if (!Number.isNaN(last) && now - last < windowSec * 1000) {
      return true
    }
  }
  await kv.put(k, String(now), { expirationTtl: 60 })
  return false
}