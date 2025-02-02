import { useState, MouseEvent, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Swatch } from '@vibrant/color'
import { cn, url2Image, imagePalette } from '@/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  [key: string]: any
}

interface ThumbnailProps {
  src: string
  alt: string
  width: number
  height: number
  highPriority?: boolean
  onInteract?: (event: MouseEvent<HTMLDivElement>) => void
}

const Thumbnail: React.FC<Props & ThumbnailProps> = ({
  id,
  src,
  alt,
  width,
  height,
  highPriority = false,
  className,
  onInteract,
  onContextMenu = e => e.preventDefault(),
  onDrag = e => e.preventDefault(),
  ...props
}) => {
  const [imageId] = useState(props['image-id'])
  const [imageClass] = useState(props['image-class'])
  const [cinematicId] = useState(props['cinematic-id'])
  const [cinematicClass] = useState(props['cinematic-class'])
  const [imgSrc, setBase64] = useState<string>()
  const [imageColor, setColor] = useState<Swatch>()

  const imgRef = useRef<HTMLImageElement>(null)

  const handleImageLoad = useCallback(async () => {
    if (imgRef.current && imgRef.current.complete) {
      const uri = url2Image(imgRef.current)
      if (uri) {
        setBase64(uri)
        setColor(await imagePalette(uri) as Swatch)
      }
    }
  }, [])
  
  return (
    <div
      id={id}
      className={cn(className)}
      onClick={onInteract}
      onContextMenu={onContextMenu}
      onDrag={onDrag}
    >
      <Image
        ref={imgRef}
        id={imageId}
        src={src}
        alt={alt}
        width={width}
        height={height}
        fetchPriority={highPriority ? 'high' : 'auto'}
        className={cn(imageClass)}
        onLoad={handleImageLoad}
      />
      {imgSrc && imageColor && (<>
        <div
          id={cinematicId}
          className={cn`${cinematicClass} pointer-events-none`}
          style={{ backgroundColor: imageColor.hex }}
        ></div>
      </>)}
    </div>
  )
}

export default Thumbnail
