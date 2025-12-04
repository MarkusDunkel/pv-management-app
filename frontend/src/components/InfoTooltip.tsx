import { Info } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: ReactNode;
  buttonAriaLabel?: string;
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
  side?: 'top' | 'bottom';
}

export const InfoTooltip = ({
  content,
  buttonAriaLabel = 'Show info',
  className,
  iconClassName,
  tooltipClassName,
  side = 'top',
}: InfoTooltipProps) => {
  const positionClass =
    side === 'top'
      ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
      : 'top-full mt-2 left-1/2 -translate-x-1/2';

  return (
    <div className={cn('group relative inline-flex', className)}>
      <Button
        type="button"
        variant="invisible"
        size="icon"
        aria-label={buttonAriaLabel}
        className={cn('text-muted-foreground hover:text-foreground', iconClassName)}
      >
        <Info className="h-4 w-4" />
      </Button>
      <div
        className={cn(
          'pointer-events-none absolute z-20 w-max max-w-xs rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100',
          positionClass,
          tooltipClassName,
        )}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
};
