import React, { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-deep-saffron hover:bg-[#c95c1f]
    text-on-primary
    shadow-sm hover:shadow-md
    active:shadow-md
    focus-ring
    dark:hover:bg-[#b84f1f]
  `,
  secondary: `
    border-2 border-royal-navy
    text-royal-navy
    bg-transparent
    hover:bg-royal-navy/5
    active:bg-royal-navy/10
    focus-ring
    dark:border-outline-variant
    dark:text-outline-variant
    dark:hover:bg-outline-variant/10
  `,
  tertiary: `
    text-royal-navy
    bg-transparent
    hover:underline
    focus-ring
    dark:text-outline-variant
  `,
  ghost: `
    bg-transparent
    text-on-surface
    hover:bg-surface-container/50
    active:bg-surface-container
    focus-ring
    dark:hover:bg-surface-container-high/50
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-label-caps font-bold rounded-md',
  md: 'px-4 py-2.5 text-body-md font-semibold rounded-md min-h-[44px]',
  lg: 'px-6 py-3 text-body-lg font-semibold rounded-lg min-h-[48px]',
};

const disabledStyles = `
  opacity-50
  cursor-not-allowed
  pointer-events-none
`;

const loadingStyles = `
  opacity-70
  pointer-events-none
`;

/**
 * Button Component
 *
 * @example
 * <Button variant="primary" size="md">
 *   Click Me
 * </Button>
 *
 * <Button variant="secondary" icon={<ChevronIcon />} iconPosition="right">
 *   Continue
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const disabled = isDisabled || isLoading;

    const baseStyles = `
      inline-flex
      items-center
      justify-center
      gap-2
      transition-all duration-200
      font-inter
      whitespace-nowrap
      ${fullWidth ? 'w-full' : ''}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${disabled ? disabledStyles : ''}
      ${isLoading ? loadingStyles : ''}
    `;

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${className}`.trim()}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {icon && iconPosition === 'left' && !isLoading && (
          <span className="flex items-center justify-center">{icon}</span>
        )}

        {children}

        {icon && iconPosition === 'right' && !isLoading && (
          <span className="flex items-center justify-center">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

/**
 * Button Group Component for Related Actions
 */
interface ButtonGroupProps {
  children: React.ReactElement<ButtonProps>[];
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, orientation = 'horizontal', fullWidth = false }, ref) => {
    const baseStyles =
      orientation === 'horizontal'
        ? 'flex gap-2 items-center'
        : 'flex flex-col gap-2 items-stretch';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${fullWidth ? 'w-full' : ''}`}
      >
        {React.Children.map(children, (child) =>
          fullWidth
            ? React.cloneElement(child, { fullWidth: true })
            : child
        )}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';
