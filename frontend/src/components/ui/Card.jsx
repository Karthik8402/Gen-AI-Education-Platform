// src/components/ui/Card.jsx
import React from 'react'

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={[
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', title, subtitle, actions, children, ...props }) {
  return (
    <div
      className={[
        'flex items-start justify-between gap-4 border-b border-gray-100 p-4',
        className,
      ].join(' ')}
      {...props}
    >
      <div>
        {title ? <h3 className="text-base font-semibold text-gray-900">{title}</h3> : null}
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={['p-4', className].join(' ')} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={['border-t border-gray-100 p-4 flex items-center justify-end gap-3', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export default Object.assign(Card, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
})
