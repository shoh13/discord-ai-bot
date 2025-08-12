// src/adapters/discord/types.ts

export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
}

export enum CallbackType {
  PONG = 1,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
}

export type CommandOption = {
  name: string
  type: number
  value?: string
  options?: CommandOption[]
}

export type Interaction = {
  type: number
  token: string
  id: string
  application_id: string
  guild_id?: string
  channel_id?: string
  data?: {
    name: string
    options?: CommandOption[]
  }
  user?: { id: string }
  member?: {
    user?: { id: string }
    permissions?: string // Discord permission bitfield as decimal string
  }
}

// Discord メッセージ（必要最小限）
export type DiscordMessage = {
  id: string
  content: string
  author?: {
    id: string
    username: string
    bot?: boolean
  }
  timestamp?: string
}