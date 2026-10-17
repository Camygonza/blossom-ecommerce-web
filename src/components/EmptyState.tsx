import { Box, Button, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

/** Estado vacío con una pequeña ilustración (maceta con brote) en lugar de un texto suelto. */
export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Stack
      spacing={2}
      sx={{ alignItems: 'center', textAlign: 'center', py: 8, px: 2 }}
      role="status"
    >
      <Box sx={{ color: 'primary.main' }}>
        {icon ?? (
          <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
            <path
              d="M48 58V34"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M48 38c0-12-8-19-20-19 0 12 7 19 20 19Z" fill="currentColor" opacity="0.85" />
            <path d="M48 34c0-9 6-14 16-14 0 9-5 14-16 14Z" fill="#b8452f" opacity="0.85" />
            <path
              d="M26 58h44l-5 26a4 4 0 0 1-4 3H35a4 4 0 0 1-4-3l-5-26Z"
              fill="currentColor"
              opacity="0.25"
            />
            <rect x="24" y="54" width="48" height="8" rx="3" fill="currentColor" opacity="0.5" />
          </svg>
        )}
      </Box>
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  )
}
