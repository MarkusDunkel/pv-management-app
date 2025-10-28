import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type Matcher } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface DatePickerProps {
  label: string;
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  date,
  onDateChange,
  placeholder,
  minDate,
  maxDate,
  disabled,
}) => {
  const disabledMatchers = React.useMemo(() => {
    const matchers: Matcher[] = [];

    if (minDate) {
      matchers.push({ before: minDate });
    }

    if (maxDate) {
      matchers.push({ after: maxDate });
    }

    return matchers;
  }, [minDate, maxDate]);

  return (
    <div className="flex min-w-[12rem] flex-row gap-1 items-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-10 justify-start gap-2 text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {date ? format(date, 'PP') : <span>{placeholder ?? label}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={disabledMatchers}
            initialFocus
            fromDate={minDate}
            toDate={maxDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
