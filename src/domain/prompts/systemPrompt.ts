// src/domain/prompts/systemPrompt.ts

// 仕様既定の SYSTEM_PROMPT
export const DEFAULT_SYSTEM_PROMPT =
  "簡潔で丁寧な日本語で回答してください。また、ユーザーに質問されたとき、毎回最初に質問文を表示してください。"

/**
 * SYSTEM_PROMPT の取得
 * - override が与えられた場合はそれを優先
 * - なければ既定値を返す
 */
export function getSystemPrompt(override?: string): string {
  const o = override?.trim()
  return o && o.length > 0 ? o : DEFAULT_SYSTEM_PROMPT
}