'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Select = ({ children, value, onValueChange }: SelectProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelect();

  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        // Mobile improvements
        'min-h-[44px] sm:min-h-[40px] touch-manipulation',
        // Better text wrapping for longer model names
        'text-left',
        className
      )}
      onClick={() => setOpen(!open)}
      ref={ref}
      {...props}
    >
      <div className="flex-1 truncate">{children}</div>
      <ChevronDown className={cn(
        "h-4 w-4 opacity-50 shrink-0 transition-transform duration-200",
        open && "transform rotate-180"
      )} />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useSelect();
  return <span>{value || placeholder}</span>;
};

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useSelect();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          'absolute top-full z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
          // Mobile improvements
          'sm:max-h-72 md:max-h-80',
          // Ensure it doesn't go off screen on mobile
          'left-0 right-0 sm:left-auto sm:right-auto sm:w-full',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { onValueChange, setOpen } = useSelect();

  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        // Mobile improvements
        'min-h-[40px] sm:min-h-[36px]',
        className
      )}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
