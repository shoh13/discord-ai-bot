// src/handlers/commands/reset.ts
import type { CommandCtx } from "./index"
import { executeReset } from "../../domain/services/resetService"
import { scopeKey } from "../../utils/scope"
import { resetHistory } from "../../adapters/kv/historyStore"
import { userFacingError } from "../../utils/errors"

export async function handle(ctx: CommandCtx) {
  const { env, interaction, respond } = ctx
  try {
    const scope = scopeKey(interaction)
    const deps = { kv: { resetHistory: (s: string) => resetHistory(env.KV, s) } }
    const msg = await executeReset(deps, { scope })
    // 仕様: /reset はエフェメラル
    await respond(msg, true)
  } catch (e: any) {
    console.error("reset handler error", e)
    await respond(userFacingError(e?.status), true)
  }
}