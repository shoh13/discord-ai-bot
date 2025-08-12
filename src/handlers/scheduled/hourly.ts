// src/handlers/scheduled/hourly.ts
import type { Env } from "../../config/env"
import { getIndexedChannels } from "../../adapters/kv/cfgStore"
import { indexChannel as indexUsecase } from "../../domain/services/indexingService"
import { getLastSeenId, setLastSeenId, getEtag, setEtag, getSnapshot, setSnapshot } from "../../adapters/kv/indexStore"
import { fetchChannelMessagesSince } from "../../adapters/discord/rest"
import { INDEX_MAX_CHANNELS_PER_RUN } from "../../config/constants"
import { jitter } from "../../utils/time"

export async function runHourly(env: Env) {
  const rawTargets = await getIndexedChannels(env.KV)
  if (!rawTargets?.length) {
    console.log("no channels configured (cfg:context:channels)")
    return
  }

  const targets = rawTargets.slice(0, INDEX_MAX_CHANNELS_PER_RUN)

  for (const ch of targets) {
    await jitter(200, 1200)
    try {
      const changed = await indexUsecase(
        {
          discord: {
            fetchSince: (channelId: string, afterId?: string) =>
              fetchChannelMessagesSince(env, channelId, afterId),
          },
          kv: {
            getLastSeenId: (id: string) => getLastSeenId(env.KV, id),
            setLastSeenId: (id: string, v: string) => setLastSeenId(env.KV, id, v),
            getEtag: (id: string) => getEtag(env.KV, id),
            setEtag: (id: string, v: string) => setEtag(env.KV, id, v),
            getSnapshot: (id: string) => getSnapshot(env.KV, id),
            setSnapshot: (id: string, v: string) => setSnapshot(env.KV, id, v),
          },
        },
        ch,
      )
      if (changed) console.log("indexed", ch)
    } catch (e: any) {
      console.error("index fail", { ch, status: e?.status, msg: String(e?.message || e) })
    }
  }
}