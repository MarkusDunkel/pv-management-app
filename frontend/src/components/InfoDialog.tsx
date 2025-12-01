import { Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/shadcn/dialog';
import { cn } from '@/lib/utils';

interface InfoDialogProps {
  title: string;
  markdown: string;
  buttonAriaLabel?: string;
  className?: string;
}

export const InfoDialog = ({
  title,
  markdown,
  buttonAriaLabel = 'Show info',
  className,
}: InfoDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="invisible" size="icon" aria-label={buttonAriaLabel} className={className}>
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className={cn('prose prose-sm max-w-none text-left', 'dark:prose-invert')}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                table({ node: _node, ...props }) {
                  return <table className="w-full table-auto" {...props} />;
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
