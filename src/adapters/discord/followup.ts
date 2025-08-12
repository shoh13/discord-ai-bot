// src/adapters/discord/followup.ts
import { FOLLOWUP_FLAGS_EPHEMERAL } from "../../config/constants"
import { safeTrimDiscord } from "../../utils/http"

const JSON_HEADER = { "content-type": "application/json" }

/**
 * Webhook Follow-up 送信
 * - ephemeral が true のとき flags=64 を付与
 * - content は安全トリムして送信
 */
export async function send(appId: string, token: string, content: string, ephemeral = false) {
  const url = `https://discord.com/api/v10/webhooks/${appId}/${token}`
  const body: any = { content: safeTrimDiscord(content || "(no content)") }
  if (ephemeral) body.flags = FOLLOWUP_FLAGS_EPHEMERAL

  const res = await fetch(url, {
    method: "POST",
    headers: JSON_HEADER,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    console.error("followup error", { status: res.status, body: t.slice(0, 200) })
  }
}