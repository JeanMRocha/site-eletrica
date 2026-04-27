import type { ReactNode } from 'react';

export function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-bars" aria-hidden="true">
      {values.length === 0 ? <span /> : null}
      {values.map((value, index) => (
        <span key={index} style={{ height: `${Math.max(18, (value / max) * 100)}%` }} />
      ))}
    </div>
  );
}

export function MiniSpark({ values }: { values: number[] }) {
  const width = 120;
  const height = 36;
  const plotted = values.length > 0 ? values : [2, 3, 4, 3];
  const max = Math.max(...plotted, 1);
  const step = plotted.length > 1 ? width / (plotted.length - 1) : width;
  const points = plotted.map((value, index) => `${index * step},${height - (value / max) * (height - 4)}`).join(' ');

  return (
    <svg className="mini-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}

export function MiniRing({ value }: { value: number }) {
  const radius = 18;
  const stroke = 6;
  const normalized = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <svg className="mini-ring" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r={radius} className="ring-track" strokeWidth={stroke} />
      <circle cx="24" cy="24" r={radius} className="ring-fill" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} />
      <text x="24" y="28" textAnchor="middle">
        {normalized}%
      </text>
    </svg>
  );
}

export function EmptyDash({ label }: { label: string }) {
  return (
    <div className="item empty-dash">
      <strong>{label}</strong>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  chart,
  caption,
}: {
  label: string;
  value: number | string;
  chart: ReactNode;
  caption?: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-head">
        <span className="metric-label">{label}</span>
        <strong>{value}</strong>
      </div>
      {chart}
      {caption ? <span className="metric-caption">{caption}</span> : null}
    </div>
  );
}
