// src/handlers/commands/ask.ts
import type { CommandCtx } from "./index"
import { executeAsk } from "../../domain/services/askService"
import { userFacingError } from "../../utils/errors"
import { scopeKey } from "../../utils/scope"
import { isCooldown } from "../../adapters/kv/cooldownStore"
import { loadHistory, saveHistory } from "../../adapters/kv/historyStore"
import { getSnapshot } from "../../adapters/kv/indexStore"
import * as groq from "../../adapters/ai/groq"
import type { Msg } from "../../adapters/kv/historyStore"

export async function handle(ctx: CommandCtx) {
  const { env, interaction, respond } = ctx

  try {
    // クールダウン
    const scope = scopeKey(interaction)
    const uid = interaction.user?.id || interaction.member?.user?.id || "unknown"
    if (await isCooldown(env.KV, scope, uid)) {
      await respond("短時間に連続しています。数秒おいて再試行してください。", true)
      return
    }

    // 引数 question
    const q =
      interaction?.data?.options?.find((o) => o.name === "question")?.value || ""

    if (!q) {
      await respond("質問を入力してください。", true)
      return
    }

    // 依存を束ねてユースケース実行
    const deps = {
      kv: {
        loadHistory: (scope: string) => loadHistory(env.KV, scope),
        saveHistory: (scope: string, msgs: Msg[]) => saveHistory(env.KV, scope, msgs),
        getSnapshot: (ch: string) => getSnapshot(env.KV, ch),
      },
      groq: {
        chat: (messages: Msg[]) => groq.chat(messages, { apiKey: env.GROQ_API_KEY || "" }),
      },
    }

    const result = await executeAsk(deps, {
      scope,
      channelId: interaction.channel_id!,
      question: String(q),
    })

    // /ask は公開フォローアップ
    await respond(result, false)
  } catch (e: any) {
    console.error("ask handler error", e)
    await respond(userFacingError(e?.status), true)
  }
}