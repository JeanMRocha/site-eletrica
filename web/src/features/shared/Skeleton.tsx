import type { CSSProperties } from 'react';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ width, height, circle, className = '', style }: SkeletonProps) {
  const styles: CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: circle ? '50%' : undefined,
    ...style,
  };

  return <span className={`skeleton ${className}`} style={styles} />;
}

export function SkeletonRow({ count = 3, height = '1rem' }: { count?: number; height?: string }) {
  return (
    <div className="stack tight">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={height} width={`${100 - i * 10}%`} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="mini-card skeleton-card">
      <Skeleton width="40%" height="1.2rem" />
      <Skeleton width="80%" />
      <Skeleton width="60%" />
    </div>
  );
}
