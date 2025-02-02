export interface thumbnail {
  width: number
  height: number
  url: string
}

export type thumbnails = {
  default: thumbnail
  high: thumbnail
  maxres: thumbnail
  medium: thumbnail
  standard: thumbnail
}

export type Localized = {
  description: string
  title: string
}

export type Snippet = {
  categoryId: string
  channelId: string
  channelTitle: string
  defaultAudioLanguage?: string
  description: string
  liveBroadcastContent?: string
  localized?: Localized
  publishedAt: string
  tags?: string[]
  thumbnails: thumbnails
  title: string
}

export type Item = {
  etag: string
  id: string
  kind: string
  snippet: Snippet
}

export interface Response {
  etag: string
  items: Item[]
  kind: string
  pageInfo: Object
}
