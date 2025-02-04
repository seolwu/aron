import { Model } from '@/types'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  [key: string]: any
}

interface ContructProps extends Props {
  onChange?: ([k, v]: [string, any]) => void
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type LayoutProps = Readonly<{ children: React.ReactNode  }>

export interface ThumbnailProps {
  src: string
  alt: string
  width: number
  height: number
  highPriority?: boolean
  onInteract?: (event: MouseEvent<HTMLDivElement>) => void
}

export interface ModelItemProps {
  model: Model
  onOpen?: () => void
  onCopy?: () => void
  onDelete?: () => void
  onThumbnailInteract?: () => void
}
