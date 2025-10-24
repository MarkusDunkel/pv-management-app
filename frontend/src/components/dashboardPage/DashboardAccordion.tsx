import type { ComponentProps, ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';
import { cn } from '@/lib/utils';

interface DashboardAccordionItemConfig {
  value: string;
  title: ReactNode;
  content: ReactNode;
  triggerClassName?: string;
}

interface DashboardAccordionProps
  extends Omit<ComponentProps<typeof Accordion>, 'children' | 'type'> {
  items: DashboardAccordionItemConfig[];
  triggerClassName?: string;
  type?: ComponentProps<typeof Accordion>['type'];
}

export const DashboardAccordion = ({
  items,
  className,
  triggerClassName = 'px-4',
  type = 'multiple',
  ...accordionProps
}: DashboardAccordionProps) => {
  return (
    <Accordion
      type={type}
      className={cn('flex w-full flex-col gap-4', className)}
      {...accordionProps}
    >
      {items.map(({ value, title, content, triggerClassName: itemTriggerClassName }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger className={itemTriggerClassName ?? triggerClassName}>
            {title}
          </AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
