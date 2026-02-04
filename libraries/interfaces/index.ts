export interface User {
  _id: string
  username: string
  normalizedUsername: string
  rank: string
  rankColor: string
  plusColor: string
  firstLogin: number
  lastLogin: number
  level: string
  ap: number
  karma: number
  ranksGifted: number
  language: string
  youtube: string
  discord: string
  twitter: string
  instagram: string
  tiktok: string
  twitch: string
  wins: number
  kills: number
  deaths: number
  kd: number
  tags: number
  playtime: number
  powerups: number
  winsRank: number
  killsRank: number
  deathsRank: number
  powerupsRank: number
  tagsRank: number
  prefixColor: string
  prefixToggled: boolean
  coins: number
  speedy: number
  blastProt: number
  slowItDown: number
  speedItUp: number
  deathEffect: string
  particle: string
  hat: string
  suit: string
  unlockedDeathEffects: { name: string, unlocked: boolean }[]
  unlockedParticles: { name: string, unlocked: boolean }[]
  unlockedHats: { name: string, unlocked: boolean }[]
  unlockedSuits: { name: string, unlocked: boolean }[]
  time: number
}

export interface Status {
  online: boolean
  playing: string
  mode: string
  map: string
}

export interface NameChange {
  name: string
  changedToAt: number
  changedToAt_latest?: number
}