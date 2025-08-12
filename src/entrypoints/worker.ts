// src/entrypoints/worker.ts
// Cloudflare Workers entrypoint（fetch/scheduled）
// 責務: 署名検証、ACK、コマンドルーティング、Cron呼び出しのみ

import type { Env } from "../config/env"
import { json } from "../utils/http"
import { userFacingError } from "../utils/errors"

import { verify } from "../adapters/discord/verify"
import { send as sendFollowup } from "../adapters/discord/followup"
import {
  InteractionType,
  CallbackType,
  type Interaction,
} from "../adapters/discord/types"

import { handleCommand } from "../handlers/commands"
import { runHourly } from "../handlers/scheduled/hourly"

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    try {
      // 本文は一度だけ読み取り、検証とパースで共有
      const raw = await req.text()

      // 署名検証（Ed25519）
      const ok = verify(raw, req.headers, env.DISCORD_PUBLIC_KEY?.trim())
      if (!ok) return new Response("unauthorized", { status: 401 })

      // JSON パース
      let body: Interaction
      try {
        body = JSON.parse(raw) as Interaction
      } catch {
        return new Response("bad request", { status: 400 })
      }

      // Ping → 即PONG
      if (body?.type === InteractionType.PING) {
        return json({ type: CallbackType.PONG })
      }

      // Application Command
      if (body?.type === InteractionType.APPLICATION_COMMAND) {
        const appId = body.application_id
        const token = body.token
        const name = body?.data?.name

        // 3秒以内にACK
        const ack = json({ type: CallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE })

        // 後続処理は非同期で実行
        ctx.waitUntil(
          (async () => {
            try {
              const respond = (msg: string, ephemeral = false) =>
                sendFollowup(appId, token, msg, ephemeral)

              await handleCommand(name, { env, interaction: body, respond })
            } catch (e: any) {
              console.error("command handler error", e)
              await sendFollowup(appId, token, userFacingError(e?.status), true)
            }
          })(),
        )

        return ack
      }

      // その他
      return new Response("ok")
    } catch (e) {
      console.error("handler error (top)", e)
      return new Response("internal error", { status: 500 })
    }
  },

  // Cron: 毎時1回
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    try {
      await runHourly(env)
    } catch (e) {
      console.error("scheduled error", e)
    }
  },
} satisfies ExportedHandler<Env>