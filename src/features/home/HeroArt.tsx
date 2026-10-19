import { Fern, Fiddle, Monstera, Sunflowers, Trailing } from '@/features/products/art/motifs'

/** Composición del hero: plantas de distinto porte sobre una misma línea de suelo, con flores al frente. */
export function HeroArt() {
  return (
    <svg
      viewBox="0 0 520 340"
      role="img"
      aria-label="Plantas y flores ilustradas"
      style={{ width: '100%', height: 'auto' }}
    >
      <circle cx="270" cy="160" r="150" fill="#fff" opacity="0.12" />
      <circle cx="440" cy="70" r="64" fill="#f4b400" opacity="0.3" />
      <circle cx="80" cy="270" r="70" fill="#fff" opacity="0.08" />
      <g transform="translate(10 49) scale(1.9)">
        <Monstera />
      </g>
      <g transform="translate(150 49) scale(1.9)">
        <Fiddle />
      </g>
      <g transform="translate(-40 142) scale(1.25)">
        <Fern />
      </g>
      <g transform="translate(150 160) scale(1.1)">
        <Sunflowers />
      </g>
      <g transform="translate(335 150) scale(1.15)">
        <Trailing />
      </g>
      <ellipse cx="260" cy="312" rx="240" ry="8" fill="#000" opacity="0.16" />
    </svg>
  )
}
