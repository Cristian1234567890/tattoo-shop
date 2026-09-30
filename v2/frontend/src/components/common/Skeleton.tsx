import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

/**
 * Luxury Studio Skeleton loader primitive.
 * Features glassmorphic dark studio aesthetic with sweeping gradient shimmer animation.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  }[variant];

  return (
    <div
      className={`relative overflow-hidden bg-white/5 border border-white/5 ${variantStyles} ${className}`}
      {...props}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default Skeleton;
