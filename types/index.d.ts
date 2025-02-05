export { VideoInfo } from './video'
export { ProvideData, Provider, Providers, ProviderCallback, ProviderFunctional } from './provider'
export { thumbnail, thumbnails, Localized, Snippet, Item, Response } from './youtube'
export { Props, ContructProps, LayoutProps, ThumbnailProps, ModelItemProps } from './component'

export type Model = {
  provider: Provider
  id: string
  videoInfo: VideoInfo
  createdAt: number
}

export type ParsedUrl = {
  url: string
  path: string
  search?: string
  params?: Record<string, string>
}

export type ControllerURLFormat = {
  name: string
  format: string
}
