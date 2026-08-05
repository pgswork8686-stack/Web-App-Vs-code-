import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2, ShieldAlert } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2",
          variant === 'primary' && "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-950",
          variant === 'secondary' && "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500",
          variant === 'outline' && "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
          variant === 'ghost' && "hover:bg-slate-100 hover:text-slate-900 text-slate-700",
          variant === 'danger' && "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Loading State Component
export function LoadingState({ message = 'Đang tải dữ liệu...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

// Permission Denied Component
export function PermissionDenied({ message = 'Bạn không có quyền truy cập tính năng này.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-red-100 bg-red-50 rounded-lg min-h-[200px]">
      <ShieldAlert className="h-10 w-10 text-red-600 mb-4" />
      <h3 className="text-lg font-semibold text-red-950 mb-1">Truy cập bị từ chối</h3>
      <p className="text-sm text-red-700 max-w-md">{message}</p>
    </div>
  );
}
