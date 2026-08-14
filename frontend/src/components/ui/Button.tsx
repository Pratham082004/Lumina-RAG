import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center h-11 px-6 rounded-[10px] font-sans font-medium text-[14px] transition-all duration-200 disabled:opacity-50 relative overflow-hidden";
    
    const variants = {
      primary: "bg-accent-teal text-[#04241d] hover:-translate-y-[1px] hover:shadow-[0_8px_30px_rgba(47,230,195,0.35)]",
      secondary: "bg-transparent text-[#c9d1de] border border-border-default hover:bg-border-default flex gap-2 items-center",
      ghost: "bg-transparent text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] border-none"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${className} ${disabled && !isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
        {...props}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : null}
        <span className={`flex items-center justify-center gap-2 w-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';
