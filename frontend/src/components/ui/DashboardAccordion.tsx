import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './shadcn/accordion';
import { cn } from '@/lib/utils';

type CommonProps = {
  className?: string;
  items: {
    value: string;
    title: React.ReactNode;
    content: React.ReactNode;
    triggerClassName?: string;
  }[];
};

type SingleProps = CommonProps & {
  type: 'single';
  value?: string;
  onValueChange?: (v: string) => void;
  collapsible?: boolean;
};

type MultipleProps = CommonProps & {
  type: 'multiple';
  value?: string[];
  onValueChange?: (v: string[]) => void;
};

type Props = SingleProps | MultipleProps;

export const DashboardAccordion = (props: Props) => {
  const { items, className, ...rest } = props;
  return (
    <Accordion className={cn('flex w-full flex-col gap-4', className)} {...rest}>
      {items.map(({ value, title, content, triggerClassName }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger className={triggerClassName}>{title}</AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
