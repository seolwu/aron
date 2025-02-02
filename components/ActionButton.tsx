import { cn } from '@/utils'
import Tooltip from '@/components/Tooltip'
import Button from '@/components/Button'

const ControlButton: React.FC<React.HTMLAttributes<HTMLDivElement> & { tooltip?: React.ReactNode }> = ({
  id,
  children,
  className,
  tooltip,
  onClick,
}) => {
  return (
    <div className='flex items-center flex-none'>
      {tooltip ? (
        <Tooltip
          position='top'
          tooltip-class='hidden lg:block mb-1.5 bg-background backdrop-blur-xl'
          tooltip={tooltip}
          className='p-0'
        >
          <Button
            id={id}
            className={cn`
              py-1.5 w-full h-full hover:bg-white/[0.03]
              border border-transparent hover:border-outline
              brightness-[0.3] group-hover/item:brightness-100
              duration-500 group-hover/item:duration-150
              ${className}
            `}
            onClick={onClick}
          >
            {children}
          </Button>
        </Tooltip>
      ) : (
        <Button
          id={id}
          className={cn`
            py-1.5 w-full h-full hover:bg-white/[0.03]
            border border-transparent hover:border-outline
            brightness-[0.3] group-hover/item:brightness-100
            duration-500 group-hover/item:duration-150
            ${className}
          `}
          onClick={onClick}
        >
          {children}
        </Button>
      )}
    </div>
  )
}

export default ControlButton