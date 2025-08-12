// src/adapters/ai/groq.ts
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "../../config/constants"
import type { Msg } from "./types"

type ChatOptions = {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
}

/**
 * Groq Chat Completions 呼び出し
 * - 仕様の既定: model=gemma2-9b-it, temperature=0.7, max_tokens=512
 * - apiKey が空の場合は 401 相当のエラーを投げる
 * - 失敗時は HTTP ステータスを含むエラーを投げる
 */
export async function chat(messages: Msg[], opts: ChatOptions): Promise<string> {
  const apiKey = opts.apiKey?.trim()
  if (!apiKey) {
    const err: any = new Error("missing GROQ_API_KEY")
    err.status = 401
    throw err
  }

  const body = {
    model: opts.model ?? DEFAULT_MODEL,
    temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
    messages,
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("groq error", { status: res.status, body: text.slice(0, 200) })
    const err: any = new Error(`groq ${res.status}`)
    err.status = res.status
    throw err
  }

  const j = await res.json()
  return j?.choices?.[0]?.message?.content || ""
}