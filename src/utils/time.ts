// src/utils/time.ts
import { LLM_TIMEOUT_MS } from "../config/constants"

/**
 * 指定msでタイムアウトさせる Promise ラッパ
 * 既定は仕様の LLM_TIMEOUT_MS=10_000
 */
export function withTimeout<T>(p: Promise<T>, ms = LLM_TIMEOUT_MS): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const t = setTimeout(() => {
			const err: any = new Error("timeout")
			err.status = 504
			reject(err)
		}, ms)
		p.then(
			(v) => {
				clearTimeout(t)
				resolve(v)
			},
			(e) => {
				clearTimeout(t)
				reject(e)
			},
		)
	})
}

/** 軽いジッター（msMin〜msMaxの一様分布） */
export function jitter(msMin = 0, msMax = 3000) {
	const n = Math.floor(msMin + Math.random() * (msMax - msMin))
	return new Promise((r) => setTimeout(r, n))
}