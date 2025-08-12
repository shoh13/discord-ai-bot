// src/adapters/discord/rest.ts
import type { Env } from "../../config/env"
import { INDEX_FETCH_CAP_PAGES } from "../../config/constants"
import type { DiscordMessage } from "./types"

/**
 * 指定チャンネルのメッセージを afterId より新しいものから最大 capPages*100 件取得
 * Discord API は新しい→古いの順で返す
 */
export async function fetchChannelMessagesSince(
  env: Env,
  channelId: string,
  afterId?: string,
  capPages = INDEX_FETCH_CAP_PAGES,
): Promise<DiscordMessage[]> {
  const all: DiscordMessage[] = []
  let page = 0
  let cursor = afterId

  while (page < capPages) {
    const url = new URL(`https://discord.com/api/v10/channels/${channelId}/messages`)
    url.searchParams.set("limit", "100")
    if (cursor) url.searchParams.set("after", cursor)

    const res = await fetch(url.toString(), {
      headers: { authorization: `Bot ${env.BOT_TOKEN}` },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("fetchChannelMessagesSince error", {
        channelId,
        status: res.status,
        body: body.slice(0, 200),
      })
      const err: any = new Error(`discord ${res.status}`)
      err.status = res.status
      throw err
    }

    const batch = (await res.json()) as DiscordMessage[]
    if (!batch.length) break
    all.push(...batch)
    cursor = batch[0].id // 先頭が最新
    page++
  }

  return all // 新しい→古い
}