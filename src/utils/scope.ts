// src/utils/scope.ts

// Discord Interaction の最小サブセット型（循環依存回避のためローカル定義）
type MinimalInteraction = {
	guild_id?: string
	channel_id?: string
	user?: { id: string }
	member?: { user?: { id: string } }
}

export function userIdOf(body: MinimalInteraction): string {
	return (body?.user?.id || body?.member?.user?.id || "unknown") as string
}

export function scopeKey(body: MinimalInteraction): string {
	return body?.guild_id ? `ch:${body?.channel_id}` : `dm:${userIdOf(body)}`
}

export function histKey(scope: string) {
	return `hist:${scope}`
}