interface VideoParams {
  [key: string]: string
}

export type VideoInfo = {
  id: string
  url: string
  title?: string
  description?: string
  thumbnailUrl: string
  filename?: string
  publishedAt?: string
  params?: VideoParams
}
