// src/domain/services/contextService.ts

export type ContextDeps = {
  kv: {
    getIndexedChannels(): Promise<string[]>
    saveIndexedChannels(ids: string[]): Promise<void>
  }
}

export type ContextInput =
  | { kind: "add"; isGuild: boolean; hasManageGuild: boolean; channelId?: string; currentChannelId?: string }
  | { kind: "remove"; isGuild: boolean; hasManageGuild: boolean; channelId?: string; currentChannelId?: string }
  | { kind: "list"; isGuild: boolean; hasManageGuild: boolean }

export async function executeContext(deps: ContextDeps, input: ContextInput): Promise<{ message: string; ephemeral?: boolean }> {
  if (!input.isGuild) {
    return { message: "このコマンドはサーバーでのみ利用できます。", ephemeral: true }
  }
  if (!input.hasManageGuild) {
    return { message: "権限が不足しています（Manage Server）。", ephemeral: true }
  }

  const list = await deps.kv.getIndexedChannels()

  if (input.kind === "list") {
    if (!list.length) return { message: "対象チャンネルはありません。" }
    const lines = list.map((id) => `• <#${id}> (${id})`).join("\n")
    return { message: `対象チャンネル一覧:\n${lines}` }
  }

  const chId = input.channelId || input.currentChannelId!
  if (!chId) return { message: "チャンネルを特定できませんでした。", ephemeral: true }

  if (input.kind === "add") {
    if (list.includes(chId)) return { message: `<#${chId}> は既に対象です。` }
    list.push(chId)
    await deps.kv.saveIndexedChannels(list)
    return { message: `追加しました: <#${chId}>` }
  }

  if (input.kind === "remove") {
    const next = list.filter((id) => id !== chId)
    if (next.length === list.length) return { message: `<#${chId}> は対象ではありません。` }
    await deps.kv.saveIndexedChannels(next)
    return { message: `除外しました: <#${chId}>` }
  }

  return { message: "未対応のサブコマンドです。", ephemeral: true }
}