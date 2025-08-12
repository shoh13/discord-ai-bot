// src/domain/prompts/builders.ts
import type { Msg } from "../../adapters/kv/historyStore"

/**
 * ユーザープロンプトの組み立て
 * - チャンネル抜粋がある場合は先頭に「最近の会話抜粋:」を付与
 * - 仕様の表記に合わせて「質問: <q>」を末尾に付加
 */
export function buildUserPrompt(question: string, ctxSnippet?: string): string {
  const q = String(question || "").trim()
  const ctx = (ctxSnippet || "").trim()
  if (ctx) return `最近の会話抜粋:\n${ctx}\n\n質問: ${q}`
  return `質問: ${q}`
}

/**
 * LLMに渡すmessages配列を構築
 * - history は user/assistant のみを想定（systemは含めない）
 * - 先頭に system を追加し、末尾に今回の user を追加
 */
export function buildMessages(systemPrompt: string, history: Msg[], currentUserPrompt: string): Msg[] {
  const sys: Msg = { role: "system", content: systemPrompt }
  const user: Msg = { role: "user", content: currentUserPrompt }
  return [sys, ...(history || []), user]
}