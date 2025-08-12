// src/utils/crypto.ts

export async function digestSha256(input: string): Promise<string> {
	const enc = new TextEncoder().encode(input)
	// @ts-ignore - Workers runtime
	const buf = await crypto.subtle.digest("SHA-256", enc)
	const arr = new Uint8Array(buf)
	return Array.from(arr)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
}