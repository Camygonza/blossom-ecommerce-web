import { useT } from '@/i18n/i18n'
import { useTheme } from '@mui/material'
import { useId, type ReactNode } from 'react'
import { C } from './palette'
import {
  Bag,
  Book,
  Calendar,
  CeramicPot,
  Fern,
  Fiddle,
  Generic,
  Lavender,
  Macrame,
  Monstera,
  Orchid,
  Peonies,
  PotSet,
  Roses,
  RoundLeaves,
  Shears,
  Spikes,
  Sprayer,
  Stack,
  Stand,
  Sunflowers,
  Tablet,
  Tags,
  Trailing,
  Trowel,
  Tulips,
  WateringCan,
} from './motifs'

export interface ArtProduct {
  name: string
  categoryId: number
  type?: 'PHYSICAL' | 'DIGITAL'
}

type Rule = [RegExp, () => ReactNode]

// El nombre manda (así un producto nuevo del admin también se ve bien); si no coincide, decide la categoría.
const BY_NAME: Rule[] = [
  [/monstera|costilla/, () => <Monstera />],
  [/pothos|potus/, () => <Trailing />],
  [/sansevieria|lengua de suegra/, () => <Spikes />],
  [/ficus/, () => <Fiddle />],
  [/calathea|calatea/, () => <RoundLeaves striped />],
  [/zamioculca|zz/, () => <RoundLeaves />],
  [/helecho|fern/, () => <Fern />],
  [/girasol/, () => <Sunflowers />],
  [/peon/, () => <Peonies />],
  [/rosa/, () => <Roses />],
  [/tulip/, () => <Tulips />],
  [/lavanda/, () => <Lavender />],
  [/orqu/, () => <Orchid />],
  [/set de 3|nórdica|nordica/, () => <PotSet />],
  [/macram/, () => <Macrame />],
  [/soporte|base de madera/, () => <Stand />],
  [/terracota|barro/, () => <CeramicPot color={C.terracotta} dark={C.terracottaDark} />],
  [/maceta/, () => <CeramicPot />],
  [/tijera|podar/, () => <Shears />],
  [/regadera/, () => <WateringCan />],
  [/herramientas|jardiner|pala|rastrillo/, () => <Trowel />],
  [/sustrato|tierra/, () => <Bag label="SUSTRATO" color={C.wood} />],
  [/fertiliz|abono/, () => <Bag label="ORGÁNICO" color={C.leafDark} />],
  [/pulveriz|spray|atomizador/, () => <Sprayer />],
  [/calendario|lunar/, () => <Calendar />],
  [/etiqueta|imprimible/, () => <Tags />],
  [/curso|video|vídeo/, () => <Tablet />],
  [/licencia|pack/, () => <Stack />],
  [/gu[ií]a|huerto|libro|ebook/, () => <Book />],
]

const BY_CATEGORY: Record<number, () => ReactNode> = {
  1: () => <Monstera />,
  2: () => <Tulips />,
  3: () => <CeramicPot />,
  4: () => <Trowel />,
  5: () => <Book />,
}

function motifFor({ name, categoryId, type }: ArtProduct): ReactNode {
  const key = name.toLowerCase()
  const byName = BY_NAME.find(([pattern]) => pattern.test(key))
  if (byName) return byName[1]()
  if (BY_CATEGORY[categoryId]) return BY_CATEGORY[categoryId]()
  return type === 'DIGITAL' ? <Book /> : <Generic />
}

// Fondo suave por categoría: [claro arriba, claro abajo, oscuro arriba, oscuro abajo]
const BACKDROPS: Record<number, [string, string, string, string]> = {
  1: ['#e6f2e8', '#cfe5d5', '#1d3427', '#16281e'],
  2: ['#fdeae3', '#f8d3c8', '#3b2622', '#2a1b18'],
  3: ['#f6ebd9', '#ecd5b6', '#3a2f22', '#2a2218'],
  4: ['#eef0dd', '#dde2c0', '#2e3320', '#222618'],
  5: ['#ece8f5', '#dad2ec', '#2a2540', '#1e1a30'],
}
const FALLBACK_BACKDROP: [string, string, string, string] = [
  '#eaf0ea',
  '#d6e3d8',
  '#1f2d25',
  '#18231c',
]

/** Ilustración del producto (SVG, 4:3) con fondo degradado, círculos suaves y sombra de suelo. */
export function ProductArt({ product, className }: { product: ArtProduct; className?: string }) {
  const dark = useTheme().palette.mode === 'dark'
  const t = useT()
  const id = useId().replace(/:/g, '')
  const palette = BACKDROPS[product.categoryId] ?? FALLBACK_BACKDROP
  const [top, bottom] = dark ? [palette[2], palette[3]] : [palette[0], palette[1]]

  return (
    <svg
      viewBox="0 0 200 150"
      role="img"
      aria-label={t(product.name)}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="0.5" cy="0.45" r="0.6">
          <stop
            offset="0"
            stopColor={dark ? '#ffffff' : '#ffffff'}
            stopOpacity={dark ? 0.06 : 0.55}
          />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#bg-${id})`} />
      <circle cx="168" cy="26" r="46" fill="#fff" opacity={dark ? 0.04 : 0.28} />
      <circle cx="26" cy="132" r="38" fill="#fff" opacity={dark ? 0.03 : 0.2} />
      <rect width="200" height="150" fill={`url(#glow-${id})`} />
      {motifFor(product)}
    </svg>
  )
}
