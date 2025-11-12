import React, { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';
import { OptimizedImage } from './OptimizedImage';

export function QRCode({ value, size = 96, ariaLabel = 'QR code' }: { value: string; size?: number; ariaLabel?: string }) {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    let mounted = true;
    QRCodeLib.toDataURL(value, { errorCorrectionLevel: 'M', width: size })
      .then((u: string) => { if (mounted) setUrl(u); })
      .catch(() => { if (mounted) setUrl(''); });
    return () => { mounted = false; };
  }, [value, size]);
  return url ? (
    <OptimizedImage src={url} width={size} height={size} alt={ariaLabel} style={{ display: 'block' }} loading="lazy" decoding="async" fetchPriority="low" />
  ) : (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', fontSize: 10, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>QR</div>
  );
}
