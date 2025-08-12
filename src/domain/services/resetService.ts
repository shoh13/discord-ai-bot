// src/domain/services/resetService.ts

export type ResetDeps = {
  kv: { resetHistory(scope: string): Promise<void> }
}
export type ResetInput = { scope: string }

export async function executeReset(deps: ResetDeps, input: ResetInput): Promise<string> {
  await deps.kv.resetHistory(input.scope)
  return "文脈をリセットしました。"
}