import React, { ReactNode, HTMLAttributes, forwardRef } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  divider?: boolean;
  hoverable?: boolean;
}

/**
 * Base Card Component
 *
 * @example
 * <Card title="Birth Details" divider>
 *   <p>Sun in Aries</p>
 *   <p>Moon in Taurus</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      children,
      padding = 'md',
      border = true,
      shadow = 'md',
      interactive = false,
      divider = false,
      hoverable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingStyles: Record<string, string> = {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    };

    const shadowStyles: Record<string, string> = {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    const baseStyles = `
      bg-ds-surface
      rounded-ds-lg
      ${border ? 'border border-ds-secondary/15' : ''}
      ${shadowStyles[shadow]}
      ${hoverable ? 'hover:shadow-ds-lg transition-shadow duration-200' : ''}
      ${interactive ? 'cursor-pointer hover:shadow-ds-lg transition-all duration-200' : ''}
      ${paddingStyles[padding]}
    `;

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${className}`.trim()}
        {...props}
      >
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-title-lg font-semibold text-on-surface">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-body-md text-on-surface-variant mt-1">
                {subtitle}
              </p>
            )}
            {divider && (title || subtitle) && (
              <div className="border-b border-on-surface-variant/20 mt-4" />
            )}
          </div>
        )}

        {/* Content Section */}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Grid Component
 * Automatically handles responsive grid layout
 */
interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactElement<CardProps>[];
}

export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({ columns = 2, gap = 'md', children, className = '', ...props }, ref) => {
    const gapStyles: Record<string, string> = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={`
          grid
          ${gapStyles[gap]}
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-${columns}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardGrid.displayName = 'CardGrid';

/**
 * Stateful Card Variant - Interactive Selection
 */
interface SelectableCardProps extends Omit<CardProps, 'onSelect'> {
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export const SelectableCard = forwardRef<HTMLDivElement, SelectableCardProps>(
  ({ selected = false, onSelect, interactive = true, ...props }, ref) => {
    const handleClick = () => {
      onSelect?.(!selected);
    };

    return (
      <Card
        ref={ref}
        {...props}
        interactive
        onClick={handleClick}
        className={`
          cursor-pointer
          transition-all duration-200
          ${
            selected
              ? 'border-deep-saffron bg-primary-fixed/10 dark:bg-primary-fixed/20 shadow-md'
              : ''
          }
          ${props.className || ''}
        `.trim()}
      />
    );
  }
);

SelectableCard.displayName = 'SelectableCard';

/**
 * Data Card Component - Optimized for Key-Value Pairs
 */
interface DataCardProps extends Omit<CardProps, 'children'> {
  data: Record<string, ReactNode>;
  dense?: boolean;
}

export const DataCard = forwardRef<HTMLDivElement, DataCardProps>(
  ({ data, dense = false, ...props }, ref) => {
    return (
      <Card ref={ref} {...props} padding="md">
        <div className={`space-y-${dense ? '2' : '4'}`}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-label-caps text-on-surface-variant uppercase tracking-wider">
                {key}
              </span>
              <span className="text-body-md text-on-surface font-semibold">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  }
);

DataCard.displayName = 'DataCard';

export default Card;
