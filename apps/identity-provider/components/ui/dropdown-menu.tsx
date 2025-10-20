'use client';

import * as React from 'react';

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block">{children}</div>;
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  { asChild?: boolean; children: React.ReactNode }
>(({ asChild, children }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement);
  }
  return <div ref={ref}>{children}</div>;
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = ({
  align = 'start',
  children,
}: {
  align?: 'start' | 'end';
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-white p-1 shadow-lg ${
        align === 'end' ? 'right-0' : 'left-0'
      }`}
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
  const baseClass = `flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${className || ''}`;

  if (asChild && React.isValidElement(children)) {
    const childProps = (children as React.ReactElement).props || {};
    return React.cloneElement(children as React.ReactElement, {
      ...childProps,
      className: baseClass,
      onClick,
    });
  }

  return (
    <div ref={ref} className={baseClass} onClick={onClick}>
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
