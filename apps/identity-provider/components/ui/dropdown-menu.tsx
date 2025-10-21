'use client';

import * as React from 'react';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<
  DropdownMenuContextType | undefined
>(undefined);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      'Dropdown components must be used within DropdownMenu provider'
    );
  }
  return context;
};

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={dropdownRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  { asChild?: boolean; children: React.ReactNode }
>(({ asChild, children }, ref) => {
  const { open } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      'aria-expanded': open,
      'aria-haspopup': 'true',
    });
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {children}
    </div>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = ({
  align = 'start',
  children,
}: {
  align?: 'start' | 'end';
  children: React.ReactNode;
}) => {
  const { open } = useDropdownMenu();

  if (!open) return null;

  return (
    <div
      className={`absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-white p-1 shadow-lg ${
        align === 'end' ? 'right-0' : 'left-0'
      }`}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  {
    asChild?: boolean;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }
>(({ asChild, children, className, onClick }, ref) => {
  const { setOpen } = useDropdownMenu();
  const baseClass = `flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 ${className || ''}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
    setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = (children as React.ReactElement).props || {};
    return React.cloneElement(children as React.ReactElement, {
      ...childProps,
      className: baseClass,
      onClick: handleClick,
      role: 'menuitem',
    });
  }

  return (
    <div
      ref={ref}
      className={baseClass}
      onClick={handleClick}
      role="menuitem"
      tabIndex={0}
    >
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
