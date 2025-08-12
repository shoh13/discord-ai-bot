import nacl from "tweetnacl"

type Env = { DISCORD_PUBLIC_KEY: string }

function hexToUint8(hex: string): Uint8Array {
	const out = new Uint8Array(hex.length / 2)
	for (let i = 0; i < out.length; i++) {
		out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
	}
	return out
}

export default {
	async fetch(req: Request, env: Env) {
		// 生本文を一度だけ読み取る
		const raw = await req.text()

		// 署名ヘッダー
		const sig = req.headers.get("X-Signature-Ed25519")
		const ts = req.headers.get("X-Signature-Timestamp")
		if (!sig || !ts) return new Response("unauthorized", { status: 401 })

		// Ed25519 検証
		const msg = new TextEncoder().encode(ts + raw)
		const ok = nacl.sign.detached.verify(
			msg,
			hexToUint8(sig),
			hexToUint8(env.DISCORD_PUBLIC_KEY),
		)
		if (!ok) return new Response("unauthorized", { status: 401 })

		// Ping → Pong
		try {
			const body = JSON.parse(raw)
			if (body?.type === 1) {
				return new Response(JSON.stringify({ type: 1 }), {
					headers: { "content-type": "application/json" },
				})
			}
		} catch (_) {
			// JSON でない場合はそのまま通す
		}

		return new Response("ok")
	},
} satisfies ExportedHandler<Env>