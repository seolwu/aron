import { cn } from '@/utils'

const Button: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ id, children, className, onClick }) => {
  return (
    <div
      id={id}
      className={cn`
        w-8 h-8 hover:bg-primary/[0.03] text-on-background
        rounded-sm border border-transparent hover:border-outline
        cursor-pointer transition-colors
        ${className}
      `}
      onClick={onClick}
    >
      <div className='flex items-center justify-center w-full h-full'>
        {children}
      </div>
    </div>
  )
}

export default Button
