import clsx from 'clsx';
import React from 'react';

export const PageContainer = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clsx(
        'mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10 xl:px-12',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
