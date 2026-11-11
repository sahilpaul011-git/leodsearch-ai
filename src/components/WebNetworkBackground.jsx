// Lightweight decorative background: glowing interconnected lines + light streak.
// Pure SVG, no canvas/3D, so it stays cheap on low-RAM Android devices.
// Purely atmospheric — never a copy of any licensed character or web-slinger art.

const NODES = [
  { x: 60, y: 90 }, { x: 220, y: 40 }, { x: 380, y: 120 },
  { x: 150, y: 220 }, { x: 340, y: 260 }, { x: 500, y: 60 },
  { x: 520, y: 220 }, { x: 40, y: 320 }, { x: 260, y: 350 },
]

const EDGES = [
  [0, 1], [1, 2], [1, 3], [2, 5], [2, 6],
  [3, 4], [4, 6], [3, 7], [4, 8], [0, 3],
]

export default function WebNetworkBackground() {
  return (
    <svg
      className="web-network-bg"
      viewBox="0 0 560 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="web-line-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#428DFF" />
          <stop offset="100%" stopColor="#956BFF" />
        </linearGradient>
      </defs>
      <g stroke="url(#web-line-grad)" strokeWidth="0.6" opacity="0.28">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
          />
        ))}
      </g>
      <g fill="#F3F5FF">
        {NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i % 3 === 0 ? 1.6 : 1} opacity="0.5" />
        ))}
      </g>
    </svg>
  )
}
