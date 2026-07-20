import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SPRING } from '@/lib/motion'

type Variant = 'primary' | 'ghost' | 'text'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ink text-paper dark:bg-ink dark:text-paper px-7 py-3 rounded-full shadow-soft hover:shadow-lift',
  ghost:
    'border border-line text-ink-soft px-5 py-2.5 rounded-full hover:border-ink-faint hover:text-ink',
  text: 'text-ink-soft hover:text-ink px-1 py-1 underline decoration-line decoration-1 underline-offset-4 hover:decoration-ink-faint',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    // GSAP (magnetic pull) and Framer Motion (hover/tap) both animate `transform` —
    // giving them separate nested elements lets both apply without fighting over it.
    const magneticRef = useMagnetic<HTMLDivElement>(0.25, 7)

    return (
      <div ref={magneticRef} className="inline-block">
        <motion.button
          ref={ref}
          data-cursor="hover"
          className={cn(
            'font-sans text-[15px] tracking-wide transition-[color,border-color,box-shadow] duration-300 ease-quiet disabled:opacity-40 disabled:pointer-events-none',
            variantClasses[variant],
            className,
          )}
          whileHover={{ y: -2, filter: 'brightness(1.06)' }}
          whileTap={{ y: 0, scale: 0.96 }}
          transition={SPRING.snappy}
          {...props}
        >
          {children}
        </motion.button>
      </div>
    )
  },
)

Button.displayName = 'Button'
