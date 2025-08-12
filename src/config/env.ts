// src/config/env.ts
// Cloudflare Workers の環境バインディング型を集約

export type Env = {
  // Discord
  DISCORD_PUBLIC_KEY: string
  BOT_TOKEN: string

  // Groq
  GROQ_API_KEY?: string

  // Storage
  KV: KVNamespace

  // 任意の将来拡張
  APPLICATION_ID?: string
}

/**
 * 必須シークレットの存在チェック（起動時に使う場合は適宜呼び出し）
 * - 署名検証とDiscord RESTには最低限 DISCORD_PUBLIC_KEY と BOT_TOKEN が必要
 * - GROQ_API_KEY は /ask 実行時になくても 401 として扱うためここでは必須化しない
 */
export function assertRequiredEnv(env: Env): void {
  if (!env.DISCORD_PUBLIC_KEY?.trim()) {
    throw new Error("Missing DISCORD_PUBLIC_KEY")
  }
  if (!env.BOT_TOKEN?.trim()) {
    throw new Error("Missing BOT_TOKEN")
  }
  // KV は wrangler.jsonc の kv_namespaces でバインドされる想定
}