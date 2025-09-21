// src/components/ui/Button.jsx
import React from 'react'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed'

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-600',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
  outline:
    'border border-indigo-600 text-indigo-700 bg-transparent hover:bg-indigo-50',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  loading = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    base,
    sizes[size] || sizes.md,
    variants[variant] || variants.primary,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} aria-disabled={props.disabled || loading} {...props}>
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
      {loading ? (
        <span className="absolute inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white"></span>
      ) : null}
    </Tag>
  )
}
