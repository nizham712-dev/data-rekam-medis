interface VisitChartProps {
  data: { label: string; count: number }[];
}

/** Grafik kolom tujuh hari terakhir: satu warna data, gridline samar, skala nyata. */
export function VisitChart({ data }: VisitChartProps) {
  const width = 620;
  const height = 156;
  const padLeft = 28;
  const padBottom = 26;
  const padTop = 12;
  const plotHeight = height - padBottom - padTop;
  const max = Math.max(4, ...data.map((item) => item.count));
  const step = max <= 4 ? 2 : Math.ceil(max / 4);
  const top = Math.ceil(max / step) * step;
  const ticks = [0, step, step * 2, step * 3, step * 4].filter((value) => value <= top);
  const usableWidth = width - padLeft - 12;
  const band = usableWidth / Math.max(data.length, 1);
  const barWidth = Math.min(34, band * 0.5);

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Jumlah kunjungan 7 hari terakhir">
        {ticks.map((tick) => {
          const y = padTop + plotHeight - (tick / top) * plotHeight;
          return (
            <g key={tick}>
              <line x1={padLeft} x2={width - 12} y1={y} y2={y} stroke="var(--rule)" strokeWidth="1" />
              <text x={padLeft - 8} y={y + 4} textAnchor="end" className="fill-[var(--faint)] text-[11px] tabular-nums">
                {tick}
              </text>
            </g>
          );
        })}
        <line x1={padLeft} x2={width - 12} y1={padTop + plotHeight} y2={padTop + plotHeight} stroke="var(--border)" strokeWidth="1" />
        {data.map((item, index) => {
          const barHeight = (item.count / top) * plotHeight;
          const x = padLeft + band * index + (band - barWidth) / 2;
          const y = padTop + plotHeight - barHeight;
          return (
            <g key={item.label}>
              <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx="2" fill="var(--accent)" />
              <title>{`${item.label}: ${item.count} kunjungan`}</title>
              <text
                x={padLeft + band * index + band / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-[var(--muted)] text-[11px]"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
