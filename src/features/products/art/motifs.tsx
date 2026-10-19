import type { ReactNode } from 'react'

/**
 * Motivos ilustrados (viewBox 200×150) que dibujan cada producto sin depender de fotos externas.
 * Son formas simples con degradados y capas para dar volumen; los colores salen de la paleta de la marca.
 */
import { C } from './palette'

const Ground = ({ y = 132, w = 56 }: { y?: number; w?: number }) => (
  <ellipse cx="100" cy={y} rx={w} ry="6" fill="#000" opacity="0.12" />
)

function Pot({ x = 100, y = 112, w = 46, color = C.terracotta, dark = C.terracottaDark }) {
  const half = w / 2
  return (
    <g>
      <path
        d={`M${x - half} ${y} h${w} l-5 ${26} a5 5 0 0 1 -5 4 h-${w - 20} a5 5 0 0 1 -5 -4 z`}
        fill={color}
      />
      <rect x={x - half - 3} y={y - 6} width={w + 6} height="10" rx="3" fill={dark} />
      <path d={`M${x - half + 6} ${y + 6} h6 l2 22 h-5 z`} fill="#fff" opacity="0.18" />
    </g>
  )
}

const Leaf = ({
  x,
  y,
  r = 0,
  s = 1,
  c = C.leaf,
}: {
  x: number
  y: number
  r?: number
  s?: number
  c?: string
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 0 C-14 -14 -14 -38 0 -52 C14 -38 14 -14 0 0Z" fill={c} />
    <path d="M0 -2 V-46" stroke="#fff" strokeWidth="1.4" opacity="0.35" />
  </g>
)

// ---------- Plantas de interior ----------
export const Monstera = () => (
  <g>
    <Ground />
    <Pot />
    <path d="M100 112 C96 90 96 70 100 52" stroke={C.leafDark} strokeWidth="3" fill="none" />
    {[
      [100, 100, -62, 1.05, C.leafDark],
      [100, 98, 58, 1.05, C.leaf],
      [100, 88, -28, 1.25, C.leaf],
      [100, 86, 30, 1.2, C.leafLight],
      [100, 76, 0, 1.15, C.leafDark],
    ].map(([x, y, r, s, c], i) => (
      <Leaf
        key={i}
        x={x as number}
        y={y as number}
        r={r as number}
        s={s as number}
        c={c as string}
      />
    ))}
    {[-30, 30].map((rot) => (
      <ellipse key={rot} cx={100 + rot * 0.9} cy="64" rx="3" ry="6" fill={C.cream} opacity="0.55" />
    ))}
  </g>
)

export const Trailing = () => (
  <g>
    <Ground />
    <Pot y={92} color={C.cream} dark={C.sand} />
    {[-30, -14, 4, 20, 34].map((dx, i) => (
      <g key={dx}>
        <path
          d={`M${100 + dx * 0.4} 88 C${100 + dx * 1.2} ${96 + i * 4} ${100 + dx * 0.8} ${112 + i * 3} ${100 + dx} ${128 - i * 2}`}
          stroke={C.leafDark}
          strokeWidth="2"
          fill="none"
        />
        {[0, 1, 2].map((k) => (
          <ellipse
            key={k}
            cx={100 + dx * (0.9 + k * 0.1)}
            cy={104 + k * 9 + i * 1.5}
            rx="7"
            ry="4.5"
            fill={k % 2 ? C.leafLight : C.leaf}
            transform={`rotate(${dx > 0 ? 30 : -30} ${100 + dx} ${104 + k * 9})`}
          />
        ))}
      </g>
    ))}
    {[-18, 0, 16].map((dx, i) => (
      <Leaf key={i} x={100 + dx} y={92} r={dx * 2.2} s={0.8} c={i === 1 ? C.leafDark : C.leaf} />
    ))}
  </g>
)

export const Spikes = () => (
  <g>
    <Ground />
    <Pot color={C.sand} dark={C.woodDark} />
    {[
      [88, -12, 1.0, C.leafDark],
      [112, 12, 1.0, C.leaf],
      [100, 0, 1.2, C.leafDark],
      [94, -5, 0.95, C.leafLight],
      [106, 6, 0.9, C.leaf],
    ].map(([x, r, s, c], i) => (
      <g key={i} transform={`translate(${x} 112) rotate(${r}) scale(${s})`}>
        <path d="M-7 0 C-9 -34 -3 -66 0 -82 C3 -66 9 -34 7 0Z" fill={c as string} />
        <path d="M0 -8 V-70" stroke={C.yellow} strokeWidth="1.2" opacity="0.5" />
      </g>
    ))}
  </g>
)

export const Fiddle = () => (
  <g>
    <Ground />
    <Pot w={50} color={C.white} dark={C.sand} />
    <path d="M100 112 V46" stroke={C.woodDark} strokeWidth="3.5" />
    {[
      [100, 100, -50],
      [100, 90, 50],
      [100, 78, -44],
      [100, 68, 46],
      [100, 58, -30],
      [100, 50, 30],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <path
          d="M0 0 C-12 -6 -14 -22 -6 -30 C0 -34 4 -30 8 -24 C14 -14 10 -4 0 0Z"
          fill={i % 2 ? C.leaf : C.leafDark}
        />
        <path d="M0 -2 V-26" stroke="#fff" strokeWidth="1.2" opacity="0.35" />
      </g>
    ))}
  </g>
)

export const RoundLeaves = ({ striped = false }: { striped?: boolean }) => (
  <g>
    <Ground />
    <Pot color={C.terracotta} />
    {[
      [100, 104, -60],
      [100, 104, 60],
      [100, 100, -32],
      [100, 100, 34],
      [100, 96, 0],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <ellipse cx="0" cy="-26" rx="17" ry="25" fill={i % 2 ? C.leaf : C.leafDark} />
        {striped ? (
          [-8, -2, 4, 10].map((o) => (
            <path
              key={o}
              d={`M0 -4 C${o} -20 ${o} -34 ${o * 0.4} -46`}
              stroke={C.leafPale}
              strokeWidth="1.6"
              fill="none"
              opacity="0.8"
            />
          ))
        ) : (
          <path d="M0 -2 V-48" stroke={C.leafPale} strokeWidth="1.4" opacity="0.6" />
        )}
      </g>
    ))}
  </g>
)

export const Fern = () => (
  <g>
    <Ground />
    <Pot color={C.wood} dark={C.woodDark} />
    {[-70, -45, -20, 5, 30, 55, 75].map((r, i) => (
      <g key={r} transform={`translate(100 108) rotate(${r})`}>
        <path d="M0 0 C-2 -30 2 -58 0 -80" stroke={C.leafDark} strokeWidth="1.6" fill="none" />
        {Array.from({ length: 9 }, (_, k) => (
          <g key={k}>
            <ellipse
              cx="-6"
              cy={-10 - k * 8}
              rx="7"
              ry="2.6"
              fill={i % 2 ? C.leaf : C.leafLight}
              transform={`rotate(-25 0 ${-10 - k * 8})`}
            />
            <ellipse
              cx="6"
              cy={-10 - k * 8}
              rx="7"
              ry="2.6"
              fill={i % 2 ? C.leaf : C.leafLight}
              transform={`rotate(25 0 ${-10 - k * 8})`}
            />
          </g>
        ))}
      </g>
    ))}
  </g>
)

// ---------- Flores ----------
const Bloom = ({
  x,
  y,
  n,
  r,
  petal,
  center,
}: {
  x: number
  y: number
  n: number
  r: number
  petal: string
  center: string
}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }, (_, i) => (
      <ellipse
        key={i}
        cx="0"
        cy={-r * 0.62}
        rx={r * 0.3}
        ry={r * 0.52}
        fill={petal}
        transform={`rotate(${(360 / n) * i})`}
      />
    ))}
    <circle r={r * 0.36} fill={center} />
  </g>
)

export const Sunflowers = () => (
  <g>
    <Ground />
    {[
      [78, 56, 22],
      [122, 50, 24],
      [100, 82, 26],
    ].map(([x, y, r], i) => (
      <g key={i}>
        <path
          d={`M${x} ${y} C${x} ${y + 30} ${100 + (x - 100) * 0.3} 110 100 132`}
          stroke={C.leafDark}
          strokeWidth="3"
          fill="none"
        />
        <Bloom x={x} y={y} n={14} r={r} petal={C.yellow} center={C.brown} />
      </g>
    ))}
    <Leaf x={100} y={128} r={-50} s={0.8} c={C.leaf} />
    <Leaf x={100} y={128} r={50} s={0.8} c={C.leafDark} />
  </g>
)

export const Roses = () => (
  <g>
    <Ground />
    {[
      [80, 70],
      [120, 66],
      [100, 52],
    ].map(([x, y], i) => (
      <g key={i}>
        <path
          d={`M${x} ${y} C${x} ${y + 30} 100 110 100 134`}
          stroke={C.leafDark}
          strokeWidth="2.4"
          fill="none"
        />
        <circle cx={x} cy={y} r="17" fill={C.rose} />
        <circle cx={x} cy={y} r="11" fill="#b8323d" />
        <path
          d={`M${x - 8} ${y} a8 8 0 0 1 16 0 a5 5 0 0 1 -10 0`}
          stroke={C.pink}
          strokeWidth="2"
          fill="none"
        />
      </g>
    ))}
    <Leaf x={100} y={126} r={-45} s={0.7} />
    <Leaf x={100} y={126} r={45} s={0.7} c={C.leafDark} />
    <path d="M78 118 L122 118 L112 134 L88 134 Z" fill={C.cream} opacity="0.9" />
  </g>
)

export const Tulips = () => (
  <g>
    <Ground />
    {[
      [78, 64, C.rose],
      [100, 50, C.yellow],
      [122, 64, C.lavender],
    ].map(([x, y, c], i) => (
      <g key={i}>
        <path
          d={`M${x} ${(y as number) + 14} C${x} 100 100 112 100 134`}
          stroke={C.leafDark}
          strokeWidth="3"
          fill="none"
        />
        <path
          d={`M${(x as number) - 14} ${y} C${(x as number) - 14} ${(y as number) + 20} ${(x as number) + 14} ${(y as number) + 20} ${(x as number) + 14} ${y} L${(x as number) + 7} ${(y as number) - 14} L${x} ${(y as number) - 4} L${(x as number) - 7} ${(y as number) - 14} Z`}
          fill={c as string}
        />
      </g>
    ))}
    <Leaf x={100} y={132} r={-30} s={0.9} />
    <Leaf x={100} y={132} r={30} s={0.9} c={C.leafDark} />
  </g>
)

export const Lavender = () => (
  <g>
    <Ground />
    <Pot color={C.white} dark={C.sand} />
    {[-38, -22, -8, 8, 22, 38].map((r, i) => (
      <g key={r} transform={`translate(100 108) rotate(${r})`}>
        <path d="M0 0 V-66" stroke={C.leafDark} strokeWidth="1.8" />
        {Array.from({ length: 7 }, (_, k) => (
          <g key={k}>
            <ellipse
              cx="-3"
              cy={-34 - k * 5}
              rx="3.2"
              ry="3"
              fill={i % 2 ? C.purple : C.lavender}
            />
            <ellipse cx="3" cy={-36 - k * 5} rx="3.2" ry="3" fill={i % 2 ? C.lavender : C.purple} />
          </g>
        ))}
      </g>
    ))}
  </g>
)

export const Orchid = () => (
  <g>
    <Ground />
    <Pot w={40} y={116} color={C.white} dark={C.sand} />
    <path d="M100 116 C96 86 104 64 122 48" stroke={C.leafDark} strokeWidth="2.6" fill="none" />
    {[
      [100, 90, 15],
      [112, 66, 13],
      [124, 48, 11],
    ].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy={-(r as number) * 0.6}
            rx={(r as number) * 0.5}
            ry={(r as number) * 0.62}
            fill={C.white}
            transform={`rotate(${a})`}
          />
        ))}
        <circle r={(r as number) * 0.28} fill={C.pink} />
      </g>
    ))}
    <Leaf x={92} y={118} r={-70} s={0.8} c={C.leaf} />
    <Leaf x={108} y={118} r={70} s={0.8} c={C.leafDark} />
  </g>
)

export const Peonies = () => (
  <g>
    <Ground />
    {[
      [82, 74, 25],
      [118, 70, 24],
      [100, 46, 22],
    ].map(([x, y, r], i) => (
      <g key={i}>
        <path
          d={`M${x} ${y} C${x} ${y + 30} 100 110 100 134`}
          stroke={C.leafDark}
          strokeWidth="2.6"
          fill="none"
        />
        <Bloom x={x} y={y} n={9} r={r} petal={C.pink} center="#f9d4de" />
        <circle cx={x} cy={y} r={(r as number) * 0.5} fill="#f7c0cf" />
        <circle cx={x} cy={y} r={(r as number) * 0.22} fill={C.yellow} />
      </g>
    ))}
    <Leaf x={100} y={130} r={-40} s={0.8} />
    <Leaf x={100} y={130} r={40} s={0.8} c={C.leafDark} />
  </g>
)

// ---------- Macetas y decoración ----------
export const CeramicPot = ({
  color = C.white,
  dark = C.sand,
}: {
  color?: string
  dark?: string
}) => (
  <g>
    <g transform="translate(100 78) scale(1.35) translate(-100 -78)">
      <Ground y={128} w={52} />
      <Pot x={100} y={84} w={58} color={color} dark={dark} />
      <path
        d="M100 84 C96 70 92 60 84 52 M100 84 C104 68 110 58 120 50"
        stroke={C.leafDark}
        strokeWidth="2.4"
        fill="none"
      />
      <Leaf x={84} y={56} r={-40} s={0.6} />
      <Leaf x={120} y={54} r={40} s={0.6} c={C.leafDark} />
    </g>
  </g>
)

export const Stand = () => (
  <g>
    <Ground y={134} w={54} />
    <rect x="52" y="64" width="96" height="8" rx="2" fill={C.wood} />
    <rect x="52" y="64" width="96" height="3" rx="1.5" fill="#fff" opacity="0.25" />
    <path
      d="M62 72 L54 134 M138 72 L146 134 M62 72 L146 134 M138 72 L54 134"
      stroke={C.woodDark}
      strokeWidth="4"
    />
    <Pot x={100} y={40} w={34} color={C.terracotta} dark={C.terracottaDark} />
    <Leaf x={100} y={44} r={-30} s={0.5} />
    <Leaf x={100} y={44} r={30} s={0.5} c={C.leafDark} />
  </g>
)

export const Macrame = () => (
  <g>
    <Ground y={134} w={44} />
    <path d="M100 8 V30" stroke={C.sand} strokeWidth="3" />
    <path
      d="M100 30 L64 84 M100 30 L136 84 M100 30 L82 88 M100 30 L118 88"
      stroke={C.sand}
      strokeWidth="2"
    />
    {[0, 1, 2].map((k) => (
      <path
        key={k}
        d={`M${70 + k * 6} ${60 + k * 8} L${130 - k * 6} ${60 + k * 8}`}
        stroke={C.sand}
        strokeWidth="1.6"
        strokeDasharray="3 3"
      />
    ))}
    <Pot x={100} y={84} w={50} color={C.terracotta} dark={C.terracottaDark} />
    {[-22, -8, 8, 22].map((dx, i) => (
      <path
        key={dx}
        d={`M${100 + dx * 0.4} 82 C${100 + dx * 1.2} ${96 + i * 3} ${100 + dx * 1.4} ${112 + i * 4} ${100 + dx * 1.6} ${128 - i * 3}`}
        stroke={C.leafDark}
        strokeWidth="2"
        fill="none"
      />
    ))}
  </g>
)

export const PotSet = () => (
  <g>
    <Ground y={132} w={64} />
    <Pot x={62} y={96} w={34} color={C.white} dark={C.sand} />
    <Pot x={104} y={86} w={44} color={C.sand} dark={C.woodDark} />
    <Pot x={146} y={100} w={30} color={C.terracotta} dark={C.terracottaDark} />
    <Leaf x={62} y={92} r={-20} s={0.5} />
    <Leaf x={104} y={82} r={10} s={0.7} c={C.leafDark} />
    <Leaf x={146} y={96} r={20} s={0.45} />
  </g>
)

// ---------- Herramientas ----------
export const Shears = () => (
  <g>
    <Ground y={130} w={50} />
    <g transform="rotate(-28 100 76)">
      <path d="M96 20 L104 20 L106 76 L94 76 Z" fill={C.steel} />
      <path d="M96 20 L100 20 L100 76 L94 76 Z" fill={C.steelDark} opacity="0.5" />
      <circle cx="100" cy="78" r="5" fill={C.ink} />
      <path d="M94 82 C84 100 78 116 86 126 L96 122 C92 112 96 100 100 88 Z" fill={C.terracotta} />
      <path
        d="M106 82 C116 100 122 116 114 126 L104 122 C108 112 104 100 100 88 Z"
        fill={C.terracottaDark}
      />
    </g>
    <Leaf x={150} y={120} r={30} s={0.55} />
  </g>
)

export const WateringCan = () => (
  <g>
    <Ground y={130} w={56} />
    <path d="M64 70 H132 L128 120 a6 6 0 0 1 -6 5 H74 a6 6 0 0 1 -6 -5 Z" fill={C.leaf} />
    <path d="M64 70 H90 L86 124 H74 a6 6 0 0 1 -6 -4 Z" fill="#fff" opacity="0.14" />
    <path d="M132 84 L164 52 L172 58 L140 100 Z" fill={C.leafDark} />
    <ellipse cx="170" cy="52" rx="9" ry="5" fill={C.leafDark} transform="rotate(-35 170 52)" />
    <path d="M70 70 C70 40 126 40 126 70" stroke={C.leafDark} strokeWidth="6" fill="none" />
    {[0, 1, 2].map((k) => (
      <path
        key={k}
        d={`M${178 + k * 4} ${56 + k * 8} q4 8 0 14`}
        stroke={C.water}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    ))}
  </g>
)

export const Trowel = () => (
  <g>
    <Ground y={132} w={56} />
    <g transform="rotate(-35 100 80)">
      <path d="M86 20 C86 4 114 4 114 20 L114 56 L86 56 Z" fill={C.wood} />
      <rect x="92" y="56" width="16" height="14" fill={C.steelDark} />
      <path d="M90 70 C80 94 90 118 100 128 C110 118 120 94 110 70 Z" fill={C.steel} />
      <path d="M100 70 V126" stroke="#fff" strokeWidth="1.4" opacity="0.4" />
    </g>
    <g transform="rotate(28 100 80) translate(34 4)">
      <rect x="96" y="14" width="8" height="52" rx="3" fill={C.woodDark} />
      <path
        d="M86 66 H114 V80 M86 66 V80 M94 66 V84 M100 66 V84 M106 66 V84"
        stroke={C.steelDark}
        strokeWidth="4"
        fill="none"
      />
    </g>
  </g>
)

export const Bag = ({ label = 'SUSTRATO', color = C.wood }: { label?: string; color?: string }) => (
  <g>
    <Ground y={134} w={54} />
    <path
      d="M56 40 C60 28 140 28 144 40 L150 126 a6 6 0 0 1 -6 6 H56 a6 6 0 0 1 -6 -6 Z"
      fill={color}
    />
    <path d="M56 40 C60 28 140 28 144 40 C120 50 80 50 56 40Z" fill="#fff" opacity="0.2" />
    <rect x="66" y="62" width="68" height="40" rx="6" fill={C.cream} />
    <text
      x="100"
      y="86"
      textAnchor="middle"
      fontSize="11"
      fontWeight="700"
      fill={C.ink}
      fontFamily="Inter, sans-serif"
    >
      {label}
    </text>
    <Leaf x={100} y={100} r={0} s={0.35} />
  </g>
)

export const Sprayer = () => (
  <g>
    <Ground y={134} w={44} />
    <rect x="66" y="64" width="52" height="68" rx="12" fill="#c9852f" />
    <rect x="66" y="64" width="16" height="68" rx="8" fill="#fff" opacity="0.2" />
    <rect x="84" y="46" width="20" height="20" fill={C.steelDark} />
    <path d="M84 46 L84 34 L128 30 L128 40 L104 46 Z" fill={C.steel} />
    <path
      d="M128 32 L140 30 M128 36 L142 38"
      stroke={C.water}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {[0, 1, 2].map((k) => (
      <circle key={k} cx={148 + k * 6} cy={26 + k * 8} r="1.8" fill={C.water} />
    ))}
  </g>
)

// ---------- Guías digitales ----------
export const Book = () => (
  <g>
    <Ground y={134} w={52} />
    <rect x="54" y="26" width="92" height="106" rx="6" fill={C.leafDark} />
    <rect x="54" y="26" width="10" height="106" rx="4" fill="#000" opacity="0.18" />
    <rect x="72" y="42" width="62" height="30" rx="4" fill={C.cream} />
    <path
      d="M84 62 C84 50 100 48 104 56 C108 48 124 50 124 62"
      stroke={C.leaf}
      strokeWidth="3"
      fill="none"
    />
    <rect x="72" y="84" width="48" height="5" rx="2.5" fill={C.cream} opacity="0.85" />
    <rect x="72" y="96" width="36" height="5" rx="2.5" fill={C.cream} opacity="0.55" />
    <Leaf x={126} y={124} r={20} s={0.45} c={C.leafPale} />
  </g>
)

export const Tablet = () => (
  <g>
    <Ground y={136} w={56} />
    <rect x="46" y="24" width="108" height="108" rx="12" fill={C.ink} />
    <rect x="53" y="31" width="94" height="94" rx="6" fill={C.cream} />
    <path d="M86 62 L120 80 L86 98 Z" fill={C.terracotta} />
    <rect x="62" y="108" width="60" height="5" rx="2.5" fill={C.leaf} />
    <circle cx="150" cy="30" r="14" fill={C.yellow} opacity="0.9" />
  </g>
)

export const Calendar = () => (
  <g>
    <Ground y={136} w={50} />
    <rect x="52" y="30" width="96" height="100" rx="10" fill={C.white} />
    <path d="M52 40 a10 10 0 0 1 10 -10 h76 a10 10 0 0 1 10 10 v14 h-96 z" fill={C.purple} />
    {[72, 128].map((x) => (
      <rect key={x} x={x - 3} y="22" width="6" height="16" rx="3" fill={C.ink} />
    ))}
    <path d="M100 66 a18 18 0 1 0 14 28 a14 14 0 1 1 -14 -28z" fill={C.yellow} />
    {[0, 1, 2, 3].map((k) => (
      <circle key={k} cx={68 + k * 22} cy="112" r="3" fill={C.leaf} />
    ))}
  </g>
)

export const Tags = () => (
  <g>
    <Ground y={134} w={52} />
    {[
      [64, 34, -12, C.leaf],
      [96, 48, 8, C.terracotta],
      [74, 82, 4, C.yellow],
    ].map(([x, y, r, c], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <path d="M0 0 H62 a8 8 0 0 1 8 8 V34 a8 8 0 0 1 -8 8 H0 L-14 21 Z" fill={c as string} />
        <circle cx="-2" cy="21" r="3" fill={C.cream} />
        <rect x="12" y="16" width="38" height="4" rx="2" fill="#fff" opacity="0.8" />
        <rect x="12" y="26" width="26" height="4" rx="2" fill="#fff" opacity="0.5" />
      </g>
    ))}
  </g>
)

export const Stack = () => (
  <g>
    <Ground y={136} w={58} />
    {[
      [48, 98, C.leafDark],
      [42, 70, C.terracotta],
      [52, 42, C.purple],
    ].map(([x, y, c], i) => (
      <g key={i}>
        <rect x={x as number} y={y as number} width="104" height="26" rx="5" fill={c as string} />
        <rect
          x={(x as number) + 8}
          y={(y as number) + 8}
          width="50"
          height="4"
          rx="2"
          fill="#fff"
          opacity="0.7"
        />
        <rect
          x={(x as number) + 8}
          y={(y as number) + 16}
          width="32"
          height="4"
          rx="2"
          fill="#fff"
          opacity="0.4"
        />
      </g>
    ))}
    <circle cx="150" cy="40" r="16" fill={C.yellow} />
    <path
      d="M143 40 l5 5 l9 -10"
      stroke={C.ink}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </g>
)

export const Generic = ({ children }: { children?: ReactNode }) => (
  <g>
    <Ground />
    {children ?? (
      <>
        {[-40, -20, 0, 20, 40].map((r, i) => (
          <Leaf
            key={r}
            x={100}
            y={120}
            r={r}
            s={1 - Math.abs(r) / 160}
            c={i % 2 ? C.leaf : C.leafDark}
          />
        ))}
      </>
    )}
  </g>
)
