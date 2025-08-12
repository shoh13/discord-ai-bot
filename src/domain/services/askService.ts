// src/domain/services/askService.ts
import { withTimeout } from "../../utils/time"
import { buildMessages, buildUserPrompt } from "../prompts/builders"
import { getSystemPrompt } from "../prompts/systemPrompt"
import { MAX_HISTORY_MESSAGES, SAFE_TRIM_LEN, LLM_TIMEOUT_MS } from "../../config/constants"
import { safeTrimDiscord } from "../../utils/http"
import type { Msg } from "../../adapters/kv/historyStore"

export type AskDeps = {
  kv: {
    loadHistory(scope: string): Promise<Msg[]>
    saveHistory(scope: string, msgs: Msg[]): Promise<void>
    getSnapshot(channelId: string): Promise<string>
  }
  groq: {
    chat(messages: Msg[]): Promise<string>
  }
  limits?: {
    maxHistoryMessages?: number
    safeTrimLen?: number
    timeoutMs?: number
  }
  systemPromptOverride?: string
}

export type AskInput = {
  scope: string
  channelId: string
  question: string
}

export async function executeAsk(deps: AskDeps, input: AskInput): Promise<string> {
  const { kv, groq } = deps
  const limits = {
    maxHistoryMessages: deps.limits?.maxHistoryMessages ?? MAX_HISTORY_MESSAGES,
    safeTrimLen: deps.limits?.safeTrimLen ?? SAFE_TRIM_LEN,
    timeoutMs: deps.limits?.timeoutMs ?? LLM_TIMEOUT_MS,
  }

  const { scope, channelId, question } = input
  const q = String(question || "").trim()
  if (!q) return "質問を入力してください。"

  // 履歴とチャンネル抜粋
  const [histAll, ctxSnippet] = await Promise.all([
    kv.loadHistory(scope),
    kv.getSnapshot(channelId),
  ])
  // 念のため履歴は上限でトリム（保存時にもトリムされるが安全側）
  const hist = histAll.slice(-limits.maxHistoryMessages)

  // プロンプト構築
  const sys = getSystemPrompt(deps.systemPromptOverride)
  const userPrompt = buildUserPrompt(q, ctxSnippet)
  const messages = buildMessages(sys, hist, userPrompt)

  // LLM 呼び出し（タイムアウト付与）
  const answer = await withTimeout(groq.chat(messages), limits.timeoutMs)

  // 履歴保存（user: question / assistant: answer）
  const updated: Msg[] = [
    ...hist,
    { role: "user", content: q },
    { role: "assistant", content: answer },
  ]
  await kv.saveHistory(scope, updated)

  // Discord 向け安全トリムで返却
  return safeTrimDiscord(answer, limits.safeTrimLen)
}