// src/utils/errors.ts

export function userFacingError(status?: number): string {
	if (status === 429) return "混雑しています。時間をおいて再試行してください。"
	if (status === 401 || status === 403) return "設定エラーが発生しています。管理者に連絡してください。"
	if (status === 504) return "タイムアウトしました。しばらくしてからもう一度お試しください。"
	return "エラーが発生しました。しばらくしてからもう一度お試しください。"
}