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
  const { items, className } = props;
  const rootClassName = cn('flex min-w-fit flex-col gap-4 p-4', className);
  const renderItems = () =>
    items.map(({ value, title, content, triggerClassName }) => (
      <AccordionItem key={value} value={value}>
        <AccordionTrigger className={triggerClassName}>{title}</AccordionTrigger>
        <AccordionContent>{content}</AccordionContent>
      </AccordionItem>
    ));

  if (props.type === 'multiple') {
    const { value, onValueChange } = props;
    const initialValue = items.map(({ value: v }) => v);

    return (
      <Accordion
        type="multiple"
        className={rootClassName}
        value={value}
        onValueChange={onValueChange}
        defaultValue={initialValue}
      >
        {renderItems()}
      </Accordion>
    );
  }

  const { value, onValueChange, collapsible } = props;
  const firstValue = items[0]?.value;
  const initialValue = firstValue;

  return (
    <Accordion
      type="single"
      className={rootClassName}
      value={value}
      onValueChange={onValueChange}
      defaultValue={initialValue}
      collapsible={collapsible}
    >
      {renderItems()}
    </Accordion>
  );
};
