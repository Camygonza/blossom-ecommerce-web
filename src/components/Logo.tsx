import { Box, Typography } from '@mui/material'

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          d="M16 29V15"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M16 16C16 9 11 5 4 5c0 7 4 11 12 11Z" fill="currentColor" />
        <path d="M16 13c0-5 3.5-8 9-8 0 5-3 8-9 8Z" fill="#b8452f" />
      </svg>
      <Typography
        component="span"
        sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, fontSize: size * 0.8 }}
      >
        Bloom
      </Typography>
    </Box>
  )
}
