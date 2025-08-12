// src/adapters/kv/historyStore.ts
import { MAX_HISTORY_MESSAGES, HISTORY_TTL_DAYS } from "../../config/constants"

export type Role = "system" | "user" | "assistant"
export type Msg = { role: Role; content: string }

const HIST = (s: string) => `hist:${s}`

/** 履歴読み込み（なければ空配列） */
export async function loadHistory(kv: KVNamespace, scope: string): Promise<Msg[]> {
  const v = await kv.get(HIST(scope))
  if (!v) return []
  try {
    return JSON.parse(v) as Msg[]
  } catch {
    return []
  }
}

/** 履歴保存（直近 MAX_HISTORY_MESSAGES にトリム、TTL=7日） */
export async function saveHistory(kv: KVNamespace, scope: string, messages: Msg[]) {
  await kv.put(HIST(scope), JSON.stringify(messages.slice(-MAX_HISTORY_MESSAGES)), {
    expirationTtl: 60 * 60 * 24 * HISTORY_TTL_DAYS,
  })
}

/** 履歴リセット */
export async function resetHistory(kv: KVNamespace, scope: string) {
  await kv.delete(HIST(scope))
}