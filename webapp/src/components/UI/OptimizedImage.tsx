import React from 'react';

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  srcSet?: string;
  sizes?: string;
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  srcSet,
  sizes,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      srcSet={srcSet}
      sizes={sizes}
    />
  );
}

