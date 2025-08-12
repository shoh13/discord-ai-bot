// src/adapters/kv/indexStore.ts

const LAST_SEEN = (ch: string) => `last_seen_id:${ch}`
const ETAG_IDS = (ch: string) => `idx:etag_ids:${ch}`
const SNAPSHOT = (ch: string) => `idx:ch:${ch}`

/** last_seen_id */
export async function getLastSeenId(kv: KVNamespace, channelId: string): Promise<string | null> {
  return (await kv.get(LAST_SEEN(channelId))) || null
}
export async function setLastSeenId(kv: KVNamespace, channelId: string, id: string): Promise<void> {
  await kv.put(LAST_SEEN(channelId), id)
}

/** etag（ID集合のハッシュ等） */
export async function getEtag(kv: KVNamespace, channelId: string): Promise<string | null> {
  return (await kv.get(ETAG_IDS(channelId))) || null
}
export async function setEtag(kv: KVNamespace, channelId: string, etag: string): Promise<void> {
  await kv.put(ETAG_IDS(channelId), etag)
}

/** スナップショット本文（テキスト） */
export async function getSnapshot(kv: KVNamespace, channelId: string): Promise<string> {
  return (await kv.get(SNAPSHOT(channelId))) || ""
}
export async function setSnapshot(kv: KVNamespace, channelId: string, snapshot: string): Promise<void> {
  await kv.put(SNAPSHOT(channelId), snapshot)
}