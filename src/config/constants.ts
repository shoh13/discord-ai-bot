// src/config/constants.ts
// 仕様で確定した定数や既定値

// LLM 既定（モデルは固定）
export const DEFAULT_MODEL = "gemma2-9b-it"
export const DEFAULT_TEMPERATURE = 0.7
export const DEFAULT_MAX_TOKENS = 512

// Discord 応答の安全トリム長（未閉じ```は呼び出し側でクローズ）
export const SAFE_TRIM_LEN = 1800

// 会話履歴: 直近 N ターン（user/assistant の 2 メッセージで 1 ターン）
export const MAX_TURNS = 6
export const MAX_HISTORY_MESSAGES = MAX_TURNS * 2 // = 12

// フォローアップのエフェメラルフラグ
export const FOLLOWUP_FLAGS_EPHEMERAL = 64

// タイムアウトやクールダウンなど
export const LLM_TIMEOUT_MS = 10_000
export const COOLDOWN_WINDOW_SEC = 5
export const HISTORY_TTL_DAYS = 7

// Cron 実行あたりの最大チャンネル数
export const INDEX_MAX_CHANNELS_PER_RUN = 5

// メッセージ取得の最大ページ（100件/ページ × N）
export const INDEX_FETCH_CAP_PAGES = 10