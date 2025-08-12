// src/handlers/commands/context.ts
import type { CommandCtx } from "./index"
import { executeContext } from "../../domain/services/contextService"
import { getIndexedChannels, saveIndexedChannels } from "../../adapters/kv/cfgStore"
import type { Interaction } from "../../adapters/discord/types"
import { userFacingError } from "../../utils/errors"

function hasManageGuild(body: Interaction): boolean {
  // 0x20 = MANAGE_GUILD
  const p = (body as any)?.member?.permissions
  if (!p) return false
  try {
    const big = BigInt(p)
    return (big & (1n << 5n)) !== 0n
  } catch {
    return false
  }
}

function optionChannelId(body: Interaction): string | undefined {
  const sub = body?.data?.options?.[0]
  const ch = sub?.options?.find((o) => o.name === "channel") as any
  return ch?.value
}

export async function handle(ctx: CommandCtx) {
  const { env, interaction, respond } = ctx
  try {
    const name = interaction?.data?.options?.[0]?.name // add | remove | list
    const isGuild = Boolean(interaction.guild_id)
    const manage = hasManageGuild(interaction)

    const deps = {
      kv: {
        getIndexedChannels: () => getIndexedChannels(env.KV),
        saveIndexedChannels: (ids: string[]) => saveIndexedChannels(env.KV, ids),
      },
    }

    if (name === "list") {
      const { message, ephemeral } = await executeContext(deps, {
        kind: "list",
        isGuild,
        hasManageGuild: manage,
      })
      await respond(message, !!ephemeral)
      return
    }

    if (name === "add" || name === "remove") {
      const chId = optionChannelId(interaction)
      const { message, ephemeral } = await executeContext(deps, {
        kind: name,
        isGuild,
        hasManageGuild: manage,
        channelId: chId,
        currentChannelId: interaction.channel_id,
      } as any)
      await respond(message, !!ephemeral)
      return
    }

    await respond("未対応のサブコマンドです。")
  } catch (e: any) {
    console.error("context handler error", e)
    await respond(userFacingError(e?.status), true)
  }
}