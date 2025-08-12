// src/handlers/commands/index.ts
import type { Env } from "../../config/env"
import type { Interaction } from "../../adapters/discord/types"

import { handle as handleAsk } from "./ask"
import { handle as handleReset } from "./reset"
import { handle as handleContext } from "./context"

export type CommandCtx = {
  env: Env
  interaction: Interaction
  respond: (msg: string, ephemeral?: boolean) => Promise<void>
}

type Handler = (ctx: CommandCtx) => Promise<void>

const routes: Record<string, Handler> = {
  ask: handleAsk,
  reset: handleReset,
  context: handleContext,
}

export async function handleCommand(name: string | undefined, ctx: CommandCtx) {
  const h = name ? routes[name] : undefined
  if (!h) return ctx.respond(`未対応のコマンドです: ${name}`, true)
  return h(ctx)
}