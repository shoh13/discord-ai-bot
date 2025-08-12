// src/adapters/kv/cfgStore.ts

const CFG_CHANNELS = "cfg:context:channels"

/** 対象チャンネル一覧の取得（なければ空配列） */
export async function getIndexedChannels(kv: KVNamespace): Promise<string[]> {
  const raw = (await kv.get(CFG_CHANNELS)) || "[]"
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** 対象チャンネル一覧の保存（重複排除） */
export async function saveIndexedChannels(kv: KVNamespace, ids: string[]): Promise<void> {
  const uniq = Array.from(new Set(ids))
  await kv.put(CFG_CHANNELS, JSON.stringify(uniq))
}