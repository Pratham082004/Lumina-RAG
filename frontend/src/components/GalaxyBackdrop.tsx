import React from 'react';

/**
 * GalaxyBackdrop — the teal/amber galaxy visual used across every page.
 *
 * Reused on:
 *   - Landing / About / Contact / NotFound / Settings: intensity="full"
 *   - Dashboard: intensity="subtle" (the chat UI is the focus)
 *   - Auth (Login / Register / Verify / Onboarding): intensity="full" via PageShell
 *
 * The keyframes, the .lumina-stars / .lumina-galaxy-core / .lumina-ticker / .lumina-node
 * classes, and the responsive breakpoints all live in `index.css` so they're defined
 * exactly once and the Hero can compose this same component.
 */

interface GalaxyChip {
  /** Symbol shown before the value, e.g. "AAPL" or "10-K". */
  sym: string;
  /** Value shown after the symbol, e.g. "+2.4%" or "Risk factors ↓ cited". */
  value: string;
  /** Optional trend. Affects color (teal for up, red for down). Defaults to neutral. */
  trend?: 'up' | 'down';
  /** Vertical position from the top of the backdrop. */
  top: string;
  /** Horizontal position from the right edge of the backdrop. */
  right: string;
  /** Stagger delay for the float animation in seconds. */
  delay: number;
}

interface GalaxyNode {
  x: number;
  y: number;
  r?: number;
  amber?: boolean;
  delay?: number;
}

export interface GalaxyBackdropProps {
  /**
   * `'full'` — the full Hero treatment: chartline + ticker chips + bright galaxy.
   * `'subtle'` — a quieter, larger, slower-spinning galaxy with no chartline or chips.
   *   Intended for the Dashboard so the visual sets the mood without competing with the chat.
   * `false` — no backdrop.
   */
  intensity?: 'full' | 'subtle' | false;
  /** Chartline points (SVG polyline coordinates). Defaults to the Hero's path. */
  chartlinePoints?: string;
  /** Chartline pulsing nodes. Defaults to the Hero's five nodes. */
  chartlineNodes?: GalaxyNode[];
  /** Floating ticker chips. Defaults to the Hero's three chips. */
  chips?: GalaxyChip[];
  /** Allows the backdrop to receive pointer events. Default `false` (decorative). */
  interactive?: boolean;
}

const DEFAULT_POINTS =
  '740,420 800,380 830,400 870,320 910,340 950,260 990,280 1030,190 1070,210 1110,140';

const DEFAULT_NODES: GalaxyNode[] = [
  { x: 830,  y: 400, delay: 0    },
  { x: 910,  y: 340, delay: 0.4  },
  { x: 990,  y: 280, amber: true, delay: 0.8 },
  { x: 1070, y: 210, delay: 1.2  },
  { x: 1110, y: 140, amber: true, r: 4, delay: 1.6 },
];

const DEFAULT_CHIPS: GalaxyChip[] = [
  { sym: 'AAPL', value: '+2.4%', trend: 'up',   top: '14%', right: '8%',  delay: 0   },
  { sym: '10-K', value: 'Risk factors ↓ cited', top: '58%', right: '4%',  delay: 1.5 },
  { sym: 'MSFT', value: '-0.6%', trend: 'down', top: '78%', right: '20%', delay: 3   },
];

const GalaxyBackdrop: React.FC<GalaxyBackdropProps> = ({
  intensity = 'full',
  chartlinePoints = DEFAULT_POINTS,
  chartlineNodes = DEFAULT_NODES,
  chips = DEFAULT_CHIPS,
  interactive = false,
}) => {
  if (intensity === false) return null;

  const isSubtle = intensity === 'subtle';
  const showChartline = !isSubtle;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      aria-hidden="true"
    >
      <div className="lumina-stars" />
      <div className={`lumina-galaxy-core keep-round${isSubtle ? ' lumina-galaxy-core--subtle' : ''}`} />

      {showChartline && (
        <svg
          className="absolute top-0 left-0 w-full h-full z-[2]"
          viewBox="0 0 1180 560"
          preserveAspectRatio="xMidYMid slice"
        >
          <polyline
            points={chartlinePoints}
            fill="none"
            stroke="rgba(47,230,195,0.45)"
            strokeWidth={1.5}
          />
          {chartlineNodes.map((n, i) => (
            <circle
              key={i}
              className={`lumina-node lumina-node--pulse${n.amber ? ' lumina-node--amber' : ''}`}
              cx={n.x}
              cy={n.y}
              r={n.r ?? 3}
              style={n.delay != null ? { animationDelay: `${n.delay}s` } : undefined}
            />
          ))}
        </svg>
      )}

      {showChartline && chips.map((c, i) => (
        <div
          key={i}
          className="lumina-ticker"
          style={{ top: c.top, right: c.right, animationDelay: `${c.delay}s` }}
        >
          <span className="lumina-ticker__sym">{c.sym}</span>
          <span className={c.trend === 'up' ? 'lumina-ticker__up' : c.trend === 'down' ? 'lumina-ticker__down' : undefined}>
            {c.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GalaxyBackdrop;
