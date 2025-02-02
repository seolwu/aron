import { cn } from '@/utils'

const ModelInfo: React.FC<{ items: (string | undefined)[] }> = ({ items }) => {
  return (<>
    {items.map((item, idx) => (
      item && (
        <div
          key={idx + item}
          className={cn`
            max-h-12 text-ellipsis first:leading-6 first:overflow-hidden
            [&:not(:first-child)]:text-on-background/75 [&:not(:first-child)]:text-sm
            [&:not(:first-child)]:font-light
            [&:not(:first-child)]:truncate [&:not(:first-child)]:whitespace-nowrap
          `}
        >
          {item}
        </div>
      )
    ))}
  </>)
}

export default ModelInfo
