import React from 'react';
import { useI18n } from '../I18nProvider';

type StatusKey = 'pr' | 'quote' | 'po' | 'processing' | 'shipped' | 'delivered' | 'invoiced' | 'paid';

export function StatusPipeline({
  statuses,
  activeIndex,
  onAdvance,
  showLabels = true,
  style,
}: {
  statuses: StatusKey[];
  activeIndex: number;
  onAdvance?: () => void;
  showLabels?: boolean;
  style?: React.CSSProperties;
}) {
  const { t } = useI18n();
  return (
    <div aria-label="Status pipeline" style={{ display: 'flex', gap: 12, alignItems: 'center', ...style }}>
      {statuses.map((key, i) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            title={t(`status.${key}`)}
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: i <= activeIndex ? 'linear-gradient(135deg, var(--module-color) 0%, var(--module-gradient-end) 100%)' : 'var(--border)',
              boxShadow:
                i === activeIndex
                  ? '0 0 10px var(--module-color), 0 0 20px var(--module-color)'
                  : 'none',
              transition: 'all 0.2s ease',
            }}
          ></div>
          {showLabels && (
            <span style={{ color: i <= activeIndex ? 'var(--module-color)' : 'var(--text-secondary)' }}>{t(`status.${key}`)}</span>
          )}
          {i < statuses.length - 1 && <div style={{ width: 24, height: 2, background: 'var(--border)' }}></div>}
        </div>
      ))}
      {onAdvance && (
        <button className="btn ghost" aria-label="Advance status" onClick={onAdvance}>
          ▶
        </button>
      )}
    </div>
  );
}

