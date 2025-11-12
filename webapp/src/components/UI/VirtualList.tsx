import React, { useMemo, useRef, useState } from 'react';

type VirtualListProps<T> = {
  items: T[];
  height: number;
  itemHeight: number;
  overscan?: number;
  role?: string; // e.g., 'list'
  renderItem: (item: T, index: number) => React.ReactNode;
};

export function VirtualList<T>({ items, height, itemHeight, overscan = 8, role = 'list', renderItem }: VirtualListProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalRows = items.length;
  const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalRows, startIndex + visibleCount);
  const visible = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  return (
    <div
      ref={scrollRef}
      onScroll={e => setScrollTop((e.target as HTMLDivElement).scrollTop)}
      style={{ height, overflowY: 'auto', position: 'relative' }}
      role={role}
      aria-label="Virtualized list"
    >
      <div style={{ height: totalRows * itemHeight, position: 'relative' }}>
        {visible.map((item, i) => {
          const idx = startIndex + i;
          return (
            <div
              key={idx}
              role={role === 'list' ? 'listitem' : undefined}
              style={{
                position: 'absolute',
                top: idx * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(item, idx)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

