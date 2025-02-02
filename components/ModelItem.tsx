'use client'

import { Suspense } from 'react'
import dayjs from 'dayjs'
import { Image as ImageIcon, ExternalLink, Trash2, ClipboardCopy } from 'lucide-react'
import { toast } from 'react-toastify'
import { cn } from '@/utils'
import { Model } from '@/types'
import Info from '@/components/ModelInfo'
import ActionButton from '@/components/ActionButton'
import Thumbnail from '@/components/Thumbnail'
import { AnimatePresence, motion } from 'motion/react'

interface Props {
  onOpen?: () => void
  onCopy?: () => void
  onDelete?: () => void
  onThumbnailInteract?: () => void
}

const Skeleton: React.FC = () => {
  return (
    <div className={cn`
      group/item bg-black/5 dark:bg-white/[0.025]
      border-x-0 md:border-x border-y border-outline
      rounded-none md:rounded-sm overflow-hidden
    `}>
      <div className={cn`
        relative grid gap-0 md:gap-2
        grid-rows-[auto_auto_auto] grid-cols-[auto]
        sm:grid-rows-[auto_auto] sm:grid-cols-[auto_1fr]
        md:grid-rows-[auto] md:grid-cols-[auto_1fr_auto]
      `}>
        <div className='p-2 w-48 aspect-video'>
          <div className='flex items-center justify-center w-[168px] h-[94px] bg-black/20'>
            <ImageIcon
              width={28}
              height={28}
              className='text-outline brightness-95 dark:brightness-125'
            />
          </div>
        </div>
        <div className='flex flex-col gap-1 px-2 sm:py-2 mb-2 md:mb-0 leading-tight overflow-hidden'>
          <div className='w-1/4 h-5 bg-white/30 dark:bg-black/10 rounded-sm'></div>
          <div className='w-2/3 h-5 bg-white/25 dark:bg-black/[0.085] rounded-sm'></div>
          <div className='w-3/5 h-5 bg-white/20 dark:bg-black/[0.08] rounded-sm'></div>
          <div className='w-4/5 h-5 bg-white/25 dark:bg-black/[0.085] rounded-sm'></div>
        </div>
      </div>
    </div>
  )
}

const Item: React.FC<Props & { model: Model }> = ({
  model,
  onOpen,
  onCopy,
  onDelete,
  onThumbnailInteract,
}) => {
  const openInNewWindow = (url: string) => window.open(url)
  const copyToClipboard = (url: string) => {
    window.navigator.clipboard.writeText(url)
    toast('Copied to clipboard!')
  }

  return (
    <AnimatePresence>
      {model.videoInfo?.thumbnailUrl && (
        <Suspense fallback={<Skeleton />}>
          <motion.a
            id='ar-model'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn`
              group/item bg-black/[0.015] dark:bg-white/[0.025]
              border-x-0 md:border-x border-y border-outline
              rounded-none md:rounded overflow-hidden appearance-none
            `}
          >
            <div className={cn`
              relative grid gap-0
              grid-rows-[auto_auto_auto] grid-cols-[auto]
              min-[425px]:grid-rows-[auto_auto] min-[425px]:grid-cols-[auto_1fr]
              sm:grid-rows-[auto_auto] sm:grid-cols-[auto_1fr]
              md:grid-rows-[auto] md:grid-cols-[auto_1fr]
            `}>
              <div className='p-0 min-[425px]:p-2 w-auto h-auto'>
                <Thumbnail
                  id='ar-thumbnail-container'
                  src={model.videoInfo.thumbnailUrl}
                  alt={model.videoInfo.title!}
                  width={455}
                  height={256}
                  className='relative w-full min-[425px]:w-[168px] cursor-pointer'
                  image-id='ar-thumbnail'
                  image-class={cn`
                    relative w-full min-[425px]:w-auto h-auto
                    rounded object-cover aspect-[4/3] z-[8]
                  `}
                  cinematic-id='ar-thumbnail-cinematic'
                  cinematic-class={cn`
                    absolute inset-0 m-auto blur-3xl
                    opacity-0 group-hover/item:opacity-35
                    group-focus/item:opacity-35 peer-focus:opacity-35
                    scale-0 group-hover/item:scale-[3]
                    group-focus/item:scale-[3] peer-focus:scale-[3]
                    transition-all duration-500 z-[7]
                  `}
                  onInteract={onThumbnailInteract}
                  onContextMenu={e => e.preventDefault()}
                />
              </div>
              <div
                id='ar-label'
                className={cn`
                  flex flex-col px-2 min-[425px]:pl-0 pt-2 min-[425px]:pt-0 min-[425px]:py-2
                  mb-2 md:mb-0 leading-tight overflow-hidden
                `}
              >
                {model.provider === 'YouTube' && (
                  <Info items={[
                    model.videoInfo.title,
                    model.videoInfo.params?.name,
                    dayjs(model.videoInfo.publishedAt).format('LL'),
                  ]} />
                )}
                {model.provider === 'File' && (
                  <Info items={[
                    model.videoInfo.filename,
                    model.videoInfo.description,
                  ]} />
                )}
              </div>
              <div
                id='ar-action'
                className={cn`
                  lg:absolute lg:bottom-0 lg:right-0 
                  col-[1/3] flex flex-row gap-1 px-1 py-1
                  bg-black/[0.025] dark:bg-black/20
                  lg:!bg-transparent lg:border-transparent
                  border-t lg:border border-outline
                  lg:rounded transition-opacity lg:opacity-45
                  lg:group-hover/item:opacity-90
                  lg:group-focus/item:opacity-90
                `}
              >
                {/* open new window */}
                <ActionButton
                  id='ar-action-open'
                  className={cn`
                    flex justify-center p-1.5 w-full
                    hover:bg-primary/10 hover:border-primary/15
                    rounded cursor-pointer transition-all
                  `}
                  onClick={() => {
                    onOpen && onOpen()
                    openInNewWindow(model.videoInfo.url)
                  }}
                >
                  <ExternalLink className='w-5 lg:w-4 h-5 lg:h-4' />
                </ActionButton>
                {/* copy to clipboard */}
                <ActionButton
                  id='ar-action-copy'
                  className={cn`
                    flex justify-center p-1.5 w-full
                    hover:bg-primary/10 hover:border-primary/15
                    rounded cursor-pointer transition-all
                  `}
                  onClick={() => {
                    onCopy && onCopy()
                    copyToClipboard(model.videoInfo.url)
                  }}
                >
                  <ClipboardCopy className='w-5 lg:w-4 h-5 lg:h-4' />
                </ActionButton>
                {/* delete item */}
                <ActionButton
                  id='ar-action-delete'
                  className={cn`
                    flex justify-center p-1.5 w-full
                    hover:bg-error/45 hover:border-error/80
                    rounded cursor-pointer transition-all
                  `}
                  onClick={() => onDelete && onDelete()}
                >
                  <Trash2 className='w-5 lg:w-4 h-5 lg:h-4' />
                </ActionButton>
              </div>
            </div>
          </motion.a>
        </Suspense>
      )}
    </AnimatePresence>)
}

export default Item
