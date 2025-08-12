// src/domain/services/indexingService.ts
import { digestSha256 } from "../../utils/crypto"
import type { DiscordMessage } from "../../adapters/discord/types"

export type IndexingDeps = {
  discord: {
    fetchSince(channelId: string, afterId?: string): Promise<DiscordMessage[]>
  }
  kv: {
    getLastSeenId(channelId: string): Promise<string | null>
    setLastSeenId(channelId: string, id: string): Promise<void>
    getEtag(channelId: string): Promise<string | null>
    setEtag(channelId: string, etag: string): Promise<void>
    getSnapshot(channelId: string): Promise<string>
    setSnapshot(channelId: string, snapshot: string): Promise<void>
  }
  etagWindow?: number // 既定200
}

/**
 * 対象チャンネルのメッセージを増分取得し、スナップショット（人間発話のみ）と ETag を更新
 * - 変更があれば true、なければ false を返す
 */
export async function indexChannel(deps: IndexingDeps, channelId: string): Promise<boolean> {
  const lastSeen = await deps.kv.getLastSeenId(channelId)
  const inc = await deps.discord.fetchSince(channelId, lastSeen || undefined)
  if (!inc.length) return false

  const newestId = inc[0].id

  // 人間発話のみ抽出（古い→新しい）
  const lines = inc
    .filter((m) => !m.author?.bot && m.content)
    .reverse()
    .map((m) => `@${m.author!.username}: ${m.content}`)
  const snapshot = lines.join("\n")

  // ID集合から ETag（先頭K件を利用）。inc は新しい→古い順
  const ids = inc.map((m) => m.id)
  const k = deps.etagWindow ?? 200
  const lastK = ids.slice(0, k)
  const newEtag = await digestSha256(JSON.stringify(lastK))

  const prevEtag = await deps.kv.getEtag(channelId)
  if (prevEtag === newEtag) {
    // ID集合に変化なし → 本文変化のみなら保存スキップ
    await deps.kv.setLastSeenId(channelId, newestId)
    return false
  }

  await deps.kv.setSnapshot(channelId, snapshot)
  await deps.kv.setEtag(channelId, newEtag)
  await deps.kv.setLastSeenId(channelId, newestId)
  return true
}