// src/utils/http.ts
import { SAFE_TRIM_LEN } from "../config/constants"

export function json(obj: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(obj), {
		headers: { "content-type": "application/json" },
		...init,
	})
}

/**
 * Discord向け安全トリム
 * - 既定1800文字でトリム
 * - 未閉じの``` を自動クローズ
 */
export function safeTrimDiscord(s: string, max = SAFE_TRIM_LEN) {
	if (!s) return s
	let out = s
	if (out.length > max) out = out.slice(0, max - 3) + "..."
	const ticks = (out.match(/```/g) || []).length
	if (ticks % 2 === 1) out += "\n```"
	return out
}