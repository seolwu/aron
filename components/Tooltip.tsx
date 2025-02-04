import { useState } from 'react'
import { cn } from '@/utils'
import { Props } from '@/types/component'

interface TooltipProps {
  tooltip: React.ReactNode
  position?: 'left' | 'top' | 'right' | 'bottom' | 'custom'
}

const Tooltip: React.FC<Props & TooltipProps> = ({
  children,
  tooltip,
  position = 'bottom',
  className,
  ...props
}) => {
  const [tooltipClass] = useState(props['tooltip-class'])

  return (
    <div className={cn`group relative pl-2 pr-1 ${className}`}>
      {children}
      {position === 'left' ? (
        <div className={cn`
          absolute px-2 py-1 w-max rounded-sm
          bg-background border border-outline
          text-sm opacity-0 group-hover:opacity-100
          transition-opacity pointer-events-none
          right-full top-1/2 mr-2 transform -translate-y-1/2
          ${tooltipClass}
        `}>
          {tooltip}
        </div>
      ) : position === 'top' ? (
        <div className={cn`
          absolute px-2 py-1 w-max rounded-sm
          bg-background border border-outline
          text-sm opacity-0 group-hover:opacity-100
          transition-opacity pointer-events-none
          bottom-full left-1/2 mb-2 transform -translate-x-1/2
          ${tooltipClass}
        `}>
          {tooltip}
        </div>
      ) : position === 'bottom' ? (
        <div className={cn`
          absolute px-2 py-1 w-max rounded-sm
          bg-background border border-outline
          text-sm opacity-0 group-hover:opacity-100
          transition-opacity pointer-events-none
          top-full left-1/2 mt-2 transform -translate-x-1/2
          ${tooltipClass}
        `}>
          {tooltip}
        </div>
      ) : position === 'right' ? (
        <div className={cn`
          absolute px-2 py-1 w-max rounded-sm
          bg-background border border-outline
          text-sm opacity-0 group-hover:opacity-100
          transition-opacity pointer-events-none
          left-full top-1/2 transform -translate-y-1/2
          ${tooltipClass}
        `}>
          {tooltip}
        </div>
      ) : (
        <div className={cn`
          absolute px-2 py-1 w-max rounded-sm
          bg-background border border-outline
          text-sm opacity-0 group-hover:opacity-100
          transition-opacity pointer-events-none
          ${tooltipClass}
        `}>
          {tooltip}
        </div>
      )}
    </div>
  )
}

export default Tooltip
